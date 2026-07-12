import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Checkout.css";
import { getCookie } from "../../helpers/cookie";
import axios from "axios";
import ShippingForm from "./ShippingForm";
import API_BASE_URL from '../../config/api';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialProducts = () => {
    // Ưu tiên lấy từ State (khi từ Cart sang)
    if (location.state?.products || location.state?.product) {
      const single = location.state?.product;
      const multiple = location.state?.products;
      return {
        list: multiple ? multiple : single ? [single] : [],
        fromCart: location.state?.fromCart || false,
        coupons: location.state?.selectedCoupons || [],
      };
    }

    const savedCheckout = localStorage.getItem("tempCheckoutData");
    if (savedCheckout) {
      try {
        return JSON.parse(savedCheckout);
      } catch (e) {
        return { list: [], fromCart: false, coupons: [] };
      }
    }
    return { list: [], fromCart: false, coupons: [] };
  };

  const initialData = getInitialProducts();
  const productsList = initialData.list;
  const fromCart = initialData.fromCart;
  const initialCoupons = initialData.coupons;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const message = params.get("message");
    const orderId = params.get("orderId");

    if (status) {
      localStorage.removeItem("tempCheckoutData");

      if (status === "success") {
        alert(`✅ Thanh toán thành công! Mã đơn hàng: ${orderId}`);
        navigate("/user");
      } else {
        const decodedMessage = message ? decodeURIComponent(message) : "Giao dịch thất bại";
        alert(`❌ Thanh toán thất bại: ${decodedMessage}. Vui lòng kiểm tra lại trong đơn hàng.`);

        navigate("/user");
      }
    }
  }, [location, navigate]);

  const loadSavedInfo = () => {
    const saved = localStorage.getItem("shippingInfo");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const [formData, setFormData] = useState({
    fullname: "",
    phone_number: "",
    email: "",
    address: "",
    note: "",
    payment_method: "COD",
    ...loadSavedInfo(),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [availableCoupons, setAvailableCoupons] = useState({
    valid: [],
    invalid: [],
  });
  const [selectedCoupons, setSelectedCoupons] = useState(initialCoupons);
  const [discount, setDiscount] = useState(0);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const token = getCookie("token");
  const userId = getCookie("userid");

  const fetchAvailableCoupons = async () => {
    if (productsList.length === 0) return;

    setLoadingCoupons(true);

    const items = productsList.map((product) => ({
      product_id: parseInt(product.id),
      quantity: parseInt(product.quantity) || 1,
      ...(product.selectedSize && { size_id: parseInt(product.selectedSize) }),
    }));

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/coupons/user/available`,
        { items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const coupons = res.data?.data || { valid: [], invalid: [] };
      setAvailableCoupons(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setAvailableCoupons({ valid: [], invalid: [] });
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    if (selectedCoupons.length === 0 || productsList.length === 0) {
      setDiscount(0);
      return;
    }

    calculateDiscount();
  }, [selectedCoupons]);

  const calculateDiscount = async () => {
    try {
      const items = productsList.map((product) => ({
        product_id: parseInt(product.id),
        quantity: parseInt(product.quantity) || 1,
        ...(product.selectedSize && {
          size_id: parseInt(product.selectedSize),
        }),
      }));

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/coupons/user/calculate`,
        {
          user_id: Number(userId),
          coupon_codes: selectedCoupons,
          items: items,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res.data?.data;

      if (data) {
        const calculatedDiscount =
          (data.sub_total || 0) - (data.total_money || 0);
        setDiscount(calculatedDiscount);
      } else {
        setDiscount(0);
      }
    } catch (error) {
      console.error("Error calculating discount:", error);
      setDiscount(0);
    }
  };

  const handleShowCoupons = () => {
    if (!token) {
      alert("Vui lòng đăng nhập để xem mã giảm giá");
      navigate("/login");
      return;
    }

    fetchAvailableCoupons();
    setShowCouponModal(true);
  };

  const handleSelectCoupon = (couponCode) => {
    const coupon = availableCoupons.valid.find((c) => c.code === couponCode);

    if (!coupon) return;

    if (coupon.applyToAll) {
      const hasGlobalCoupon = selectedCoupons.some((code) => {
        const c = availableCoupons.valid.find((x) => x.code === code);
        return c?.applyToAll;
      });

      if (hasGlobalCoupon) {
        const filtered = selectedCoupons.filter((code) => {
          const c = availableCoupons.valid.find((x) => x.code === code);
          return !c?.applyToAll;
        });
        setSelectedCoupons([...filtered, couponCode]);
      } else {
        setSelectedCoupons([...selectedCoupons, couponCode]);
      }
    } else {
      const productCoupons = selectedCoupons.filter((code) => {
        const c = availableCoupons.valid.find((x) => x.code === code);
        return c?.productId === coupon.productId;
      });

      if (productCoupons.length > 0) {
        const filtered = selectedCoupons.filter((code) => {
          const c = availableCoupons.valid.find((x) => x.code === code);
          return c?.productId !== coupon.productId;
        });
        setSelectedCoupons([...filtered, couponCode]);
      } else {
        setSelectedCoupons([...selectedCoupons, couponCode]);
      }
    }
  };

  const handleRemoveCoupon = (couponCode) => {
    setSelectedCoupons(selectedCoupons.filter((c) => c !== couponCode));
  };

  const isCouponSelected = (couponCode) => {
    return selectedCoupons.includes(couponCode);
  };

  const handleConfirmCoupons = () => {
    setShowCouponModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveInfoChange = (e) => {
    setSaveInfo(e.target.checked);
  };

  const saveShippingInfo = () => {
    const infoToSave = {
      fullname: formData.fullname,
      phone_number: formData.phone_number,
      email: formData.email,
      address: formData.address,
    };
    localStorage.setItem("shippingInfo", JSON.stringify(infoToSave));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const clearSavedInfo = () => {
    localStorage.removeItem("shippingInfo");
    setFormData({
      fullname: "",
      phone_number: "",
      email: "",
      address: "",
      note: "",
      payment_method: "COD",
    });
    alert("Đã xóa thông tin đã lưu");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullname || !formData.phone_number) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!formData.address || formData.address.trim().length < 10) {
      setError("Vui lòng nhập địa chỉ giao hàng đầy đủ (tối thiểu 10 ký tự)");
      return;
    }

    if (productsList.length === 0) {
      setError("Không tìm thấy thông tin sản phẩm");
      return;
    }

    if (saveInfo) {
      saveShippingInfo();
    }

    try {
      setLoading(true);
      const token = getCookie("token");

      if (!token) {
        setError("Vui lòng đăng nhập để đặt hàng");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }

      const paymentMethodMap = {
        COD: 1,
        MOMO: 2,
      };

      const items = productsList.map((product) => ({
        product_id: parseInt(product.id),
        size_id: parseInt(product.selectedSize),
        quantity: parseInt(product.quantity) || 1,
      }));

      const orderData = {
        fullname: formData.fullname.trim(),
        phone_number: formData.phone_number.trim(),
        address: formData.address.trim(),
        payment_method_id: paymentMethodMap[formData.payment_method] || 1,
        items: items,
      };

      if (selectedCoupons.length > 0) {
        orderData.coupon_codes = selectedCoupons;
      }

      if (formData.email && formData.email.trim()) {
        orderData.email = formData.email.trim();
      }

      if (formData.note && formData.note.trim()) {
        orderData.note = formData.note.trim();
      }

      console.log("Order Data:", orderData);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/orders/user/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        }
      );


      const result = await response.json();

      if (response.ok) {
        const orderId = result.data?.id;

        if (fromCart) {
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const productIds = productsList.map((p) => p.id);
          const remaining = cart.filter(
            (item) => !productIds.includes(item.product_id)
          );
          localStorage.setItem("cart", JSON.stringify(remaining));
          window.dispatchEvent(new Event("cartUpdated"));
        }

        if (formData.payment_method === "MOMO" && orderId) {
          localStorage.setItem("tempCheckoutData", JSON.stringify({
            list: productsList,
            fromCart: fromCart,
            coupons: selectedCoupons
          }));

          try {
            const paymentResponse = await fetch(
              `${API_BASE_URL}/api/v1/payment/user/create/${orderId}?gateway=momo`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const paymentResult = await paymentResponse.json();

            if (paymentResponse.ok && paymentResult.data?.payUrl) {
              window.location.href = paymentResult.data.payUrl;
            } else {
              setError(
                paymentResult.message || "Không thể tạo thanh toán MoMo"
              );
            }
          } catch (paymentErr) {
            setError("Có lỗi khi tạo thanh toán MoMo");
          }
        } else {
          localStorage.removeItem("tempCheckoutData");
          alert(result.message || "Đặt hàng thành công!");
          navigate("/");
        }
      } else {
        setError(result.message || "Đặt hàng thất bại");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const isPaymentRedirect = new URLSearchParams(location.search).get("status");

  if (productsList.length === 0 && !isPaymentRedirect) {
    return (
      <div className="checkout-container">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Không tìm thấy thông tin sản phẩm</p>
          <button
            onClick={() => navigate(-1)}
            style={{ padding: "10px 20px", cursor: "pointer" }}
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (productsList.length === 0 && isPaymentRedirect) {
    return (
      <div className="checkout-container">
        <div style={{ padding: "50px", textAlign: "center" }}>
          <h2>Đang xử lý kết quả thanh toán...</h2>
          <p style={{color: "#666", marginTop: "10px"}}>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  const subtotal = productsList.reduce((sum, product) => {
    const price = product.display_price || product.price;
    const quantity = product.quantity || 1;
    return sum + price * quantity;
  }, 0);

  const totalPrice = Math.max(subtotal - discount, 0);

  return (
    <div className="checkout-container">
      <h1>Thanh toán đơn hàng</h1>

      {error && <div className="error-alert">{error}</div>}

      {showSaveSuccess && (
        <div className="success-alert">✓ Đã lưu thông tin giao hàng</div>
      )}

      <div className="checkout-content">
        <div className="product-summary">
          <h2>Sản phẩm đã chọn ({productsList.length})</h2>

          <div className="products-list">
            {productsList.map((product, index) => {
              const unitPrice = product.display_price || product.price;
              const quantity = product.quantity || 1;

              return (
                <div
                  key={index}
                  className={`product-info ${
                    index < productsList.length - 1 ? "with-border" : ""
                  }`}
                >
                  <img
                    src={`${API_BASE_URL}${product.thumbnail}`}
                    alt={product.name}
                    crossOrigin="anonymous"
                  />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="price">
                      {unitPrice.toLocaleString("vi-VN")} đ
                    </p>
                    <p>Size: {product.selectedSizeName}</p>
                    <p>Số lượng: {quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="coupon-section">
            <button
              type="button"
              onClick={handleShowCoupons}
              className="coupon-button"
            >
              🎁 Chọn mã giảm giá
            </button>

            {selectedCoupons.length > 0 && (
              <div className="selected-coupons">
                <p className="selected-coupons-label">
                  Đã chọn {selectedCoupons.length} mã:
                </p>
                {selectedCoupons.map((code) => {
                  const coupon = availableCoupons.valid.find(
                    (c) => c.code === code
                  );
                  return (
                    <div key={code} className="coupon-item">
                      <span className="coupon-code-badge">{code}</span>

                      {coupon && (
                        <span className="coupon-desc1">
                          {coupon.description}
                        </span>
                      )}
                      <button
                        onClick={() => handleRemoveCoupon(code)}
                        className="coupon-remove-btn"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="price-summary">
            <div className="price-row">
              <span>Tạm tính:</span>
              <span>{subtotal.toLocaleString("vi-VN")} đ</span>
            </div>

            {discount > 0 && (
              <div className="price-row discount">
                <span>Giảm giá:</span>
                <span>-{discount.toLocaleString("vi-VN")} đ</span>
              </div>
            )}

            <div className="price-row total">
              <span>Tổng tiền:</span>
              <span className="total-amount">
                {totalPrice.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>
        </div>

        <ShippingForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onBack={() => navigate(-1)}
          loading={loading}
          saveInfo={saveInfo}
          onSaveInfoChange={handleSaveInfoChange}
          onClearSavedInfo={clearSavedInfo}
        />
      </div>

      {showCouponModal && (
        <div
          className="coupon-modal-overlay"
          onClick={() => setShowCouponModal(false)}
        >
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal-header">
              <h2>Chọn mã giảm giá</h2>
              <button
                onClick={() => setShowCouponModal(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <div className="coupon-modal-body">
              {loadingCoupons ? (
                <p className="coupon-loading">Đang tải mã giảm giá...</p>
              ) : availableCoupons.valid.length > 0 ? (
                <>
                  {availableCoupons.valid.map((coupon) => (
                    <div
                      key={coupon.id}
                      className={`coupon-card ${
                        isCouponSelected(coupon.code) ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (isCouponSelected(coupon.code)) {
                          handleRemoveCoupon(coupon.code);
                        } else {
                          handleSelectCoupon(coupon.code);
                        }
                      }}
                    >
                      <div className="coupon-card-content">
                        <div className="coupon-info">
                          <div className="coupon-tags">
                            <span className="coupon-tag">{coupon.code}</span>
                          </div>

                          <h4 className="coupon-name">{coupon.name}</h4>

                          <p className="coupon-description">
                            💰 {coupon.description}
                          </p>

                          <div className="coupon-scope">
                            📌 {coupon.applicableScope}
                          </div>
                        </div>

                        <div className="coupon-checkbox">
                          {isCouponSelected(coupon.code) ? (
                            <div className="checkbox-checked">✓</div>
                          ) : (
                            <div className="checkbox-unchecked" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="no-coupons">
                  Không có mã giảm giá khả dụng cho đơn hàng này
                </p>
              )}
            </div>

            <div className="coupon-modal-footer">
              <button
                onClick={() => setShowCouponModal(false)}
                className="modal-cancel-btn"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmCoupons}
                className="modal-confirm-btn"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;