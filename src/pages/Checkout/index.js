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


  /**
     * Hàm lấy danh sách sản phẩm ban đầu
     */
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

     // Lấy từ localStorage nếu không có trong state
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

  /**
     * useEffect xử lý kết quả thanh toán khi quay lại từ cổng thanh toán
     */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get("status");
    const message = params.get("message");
    const orderId = params.get("orderId");

    if (status) {
       // Xóa dữ liệu tạm thời sau khi xử lý
      localStorage.removeItem("tempCheckoutData");

      if (status === "success") {
        alert(`Thanh toán thành công! Mã đơn hàng: ${orderId}`);
        navigate("/user");
      } else {
        const decodedMessage = message ? decodeURIComponent(message) : "Giao dịch thất bại";
        alert(`Thanh toán thất bại: ${decodedMessage}. Vui lòng kiểm tra lại trong đơn hàng.`);

        navigate("/user");
      }
    }
  }, [location, navigate]);

  /**
     * Hàm tải thông tin giao hàng đã lưu từ localStorage
     */
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

  // Khởi tạo state cho form dữ liệu
  const [formData, setFormData] = useState({
    fullname: "",
    phone_number: "",
    email: "",
    address: "",
    note: "",
    payment_method: "COD",
    ...loadSavedInfo(),// Gộp thông tin đã lưu vào
  });

  // Các state quản lý trạng thái UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveInfo, setSaveInfo] = useState(true);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);


  // Các state quản lý coupon
  const [availableCoupons, setAvailableCoupons] = useState({
    valid: [],
    invalid: [],
  });
  const [selectedCoupons, setSelectedCoupons] = useState(initialCoupons);
  const [discount, setDiscount] = useState(0);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);

  // Lấy thông tin xác thực từ cookie
  const token = getCookie("token");
  const userId = getCookie("userid");

  const fetchAvailableCoupons = async () => {
    if (productsList.length === 0) return;

    setLoadingCoupons(true);

    // Chuẩn bị dữ liệu sản phẩm
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

   /**
     * useEffect tính toán lại giảm giá khi danh sách coupon được chọn thay đổi
     */
  useEffect(() => {
    if (selectedCoupons.length === 0 || productsList.length === 0) {
      setDiscount(0);
      return;
    }

    calculateDiscount();
  }, [selectedCoupons]);

   /**
     * Hàm gọi API để tính toán số tiền giảm giá
     */
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
         // Tính số tiền giảm = tạm tính - tổng tiền sau giảm
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

   /**
     * Hàm xử lý khi người dùng chọn một mã coupon
     * Áp dụng logic:
     * - Nếu coupon áp dụng toàn bộ đơn: thay thế coupon toàn bộ cũ
     * - Nếu coupon áp dụng cho sản phẩm cụ thể: thay thế coupon cùng sản phẩm
     */
  const handleSelectCoupon = (couponCode) => {
    const coupon = availableCoupons.valid.find((c) => c.code === couponCode);

    if (!coupon) return;

    if (coupon.applyToAll) {
      // Xử lý coupon áp dụng toàn bộ
      const hasGlobalCoupon = selectedCoupons.some((code) => {
        const c = availableCoupons.valid.find((x) => x.code === code);
        return c?.applyToAll;
      });

      if (hasGlobalCoupon) {
         // Thay thế coupon toàn bộ cũ
        const filtered = selectedCoupons.filter((code) => {
          const c = availableCoupons.valid.find((x) => x.code === code);
          return !c?.applyToAll;
        });
        setSelectedCoupons([...filtered, couponCode]);
      } else {
        setSelectedCoupons([...selectedCoupons, couponCode]);
      }
    } else {
       // Xử lý coupon áp dụng cho sản phẩm cụ thể
      const productCoupons = selectedCoupons.filter((code) => {
        const c = availableCoupons.valid.find((x) => x.code === code);
        return c?.productId === coupon.productId;
      });

      if (productCoupons.length > 0) {
         // Thay thế coupon cùng sản phẩm
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

   /**
     * Hàm xóa thông tin đã lưu trong localStorage
     * Reset form về trạng thái ban đầu
     */
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

    // Validate thông tin bắt buộc
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

    // Lưu thông tin nếu được chọn
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

      // Mapping phương thức thanh toán
      const paymentMethodMap = {
        COD: 1,
        MOMO: 2,
      };

        // Chuẩn bị dữ liệu sản phẩm
      const items = productsList.map((product) => ({
        product_id: parseInt(product.id),
        size_id: parseInt(product.selectedSize),
        quantity: parseInt(product.quantity) || 1,
      }));

      // Chuẩn bị dữ liệu đơn hàng
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


      // Gọi API tạo đơn hàng
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

        // Xóa sản phẩm khỏi giỏ hàng nếu đặt từ cart
        if (fromCart) {
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const productIds = productsList.map((p) => p.id);
          const remaining = cart.filter(
            (item) => !productIds.includes(item.product_id)
          );
          localStorage.setItem("cart", JSON.stringify(remaining));
          window.dispatchEvent(new Event("cartUpdated"));
        }

        // Xử lý thanh toán MoMo
        if (formData.payment_method === "MOMO" && orderId) {
          // Lưu dữ liệu tạm để khôi phục sau khi thanh toán
          localStorage.setItem("tempCheckoutData", JSON.stringify({
            list: productsList,
            fromCart: fromCart,
            coupons: selectedCoupons
          }));

          try {
            // Gọi API tạo thanh toán MoMo
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

              // Chuyển hướng đến cổng thanh toán MoMo
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
          // Xử lý thanh toán COD
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

  // Kiểm tra xem có phải đang xử lý kết quả thanh toán không
  const isPaymentRedirect = new URLSearchParams(location.search).get("status");

  // Hiển thị thông báo nếu không có sản phẩm và không phải redirect thanh toán
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
  // Hiển thị thông báo đang xử lý thanh toán
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
  // Tính tạm tính (tổng tiền trước giảm giá)
  const subtotal = productsList.reduce((sum, product) => {
    const price = product.display_price || product.price;
    const quantity = product.quantity || 1;
    return sum + price * quantity;
  }, 0);
  // Tính tổng tiền sau giảm giá (không âm)
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

             { /* Hiển thị các coupon đã chọn */ }
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
      
        { /* Modal chọn mã giảm giá */ } 
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
