
import { useEffect, useState } from "react";
import "./Cart.css";
import { Plus, Minus, Trash2, Tag, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../helpers/cookie";
import axios from "axios";
import { ShoppingCartOutlined } from "@ant-design/icons";
import CouponModal from "./CouponModal"; 
import API_BASE_URL from '../../config/api';

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState({
    valid: [],
    invalid: [],
  });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const userId = getCookie("userid");
  const token = getCookie("token");

  const formatPrice = (value) => Number(value || 0).toLocaleString("vi-VN");

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = Math.max(subtotal - discount, 0);

  const isAllSelected =
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  // LOAD CART
  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartItems(savedCart);
    };
    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  // LOAD AVAILABLE COUPONS
  const fetchAvailableCoupons = async () => {
    if (selectedCartItems.length === 0) {
      setAvailableCoupons({ valid: [], invalid: [] });
      return;
    }

    setLoadingCoupons(true);

    const items = selectedCartItems.map((item) => {
      const payload = {
        product_id: item.product_id,
        quantity: item.quantity,
      };

      if (item.size_id) {
        payload.size_id = item.size_id;
      }

      return payload;
    });

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


  // VERIFY CART
  const verifyCart = async () => {
    if (selectedCartItems.length === 0) {
      setVerifyData(null);
      setVerifyError(null);
      return;
    }

    try {
      const items = selectedCartItems.map((item) => {
        const payload = {
          product_id: item.product_id,
          quantity: item.quantity,
        };

        if (item.size_id) {
          payload.size_id = item.size_id;
        }

        return payload;
      });

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/cart/public/verify`,
        { items }
      );

      setVerifyData(res.data);
      setVerifyError(null);
    } catch {
      setVerifyError("Không thể xác thực giỏ hàng");
      setVerifyData(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      verifyCart();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedItems, cartItems]);


  // Tính discount khi có coupon được chọn
  useEffect(() => {
    if (selectedCoupons.length === 0 || selectedCartItems.length === 0) {
      setDiscount(0);
      return;
    }

    calculateDiscount();
  }, [selectedCoupons, selectedCartItems]);


  const calculateDiscount = async () => {
    try {
      const items = selectedCartItems.map((item) => {
        const payload = {
          product_id: item.product_id,
          quantity: item.quantity,
        };

        if (item.size_id) {
          payload.size_id = item.size_id;
        }

        return payload;
      });

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

      // Lấy dữ liệu từ response
      const data = res.data?.data;
      
      if (data) {
        // Tính discount = sub_total - total_money
        const calculatedDiscount = (data.sub_total || 0) - (data.total_money || 0);
        setDiscount(calculatedDiscount);
        
        console.log('Discount calculation:', {
          sub_total: data.sub_total,
          total_money: data.total_money,
          discount: calculatedDiscount,
          product_discount: data.product_discount,
          global_discount: data.global_discount
        });
      } else {
        setDiscount(0);
      }
    } catch (error) {
      console.error("Error calculating discount:", error);
      setDiscount(0);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const updateCart = (updated) => {
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleIncreaseQuantity = (id) => {
    updateCart(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    updateCart(
      cartItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleOpenCouponModal = () => {
    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn sản phẩm trước");
      return;
    }

    if (!token) {
      alert("Vui lòng đăng nhập để xem mã giảm giá");
      navigate("/login");
      return;
    }

    fetchAvailableCoupons();
    setShowCouponModal(true);
  };

  const handleApplyCoupons = (couponCodes) => {
    setSelectedCoupons(couponCodes);
  };

  const handleRemoveCoupon = (code) => {
    setSelectedCoupons(selectedCoupons.filter((c) => c !== code));
  };

  const handleCheckout = () => {
  if (!token) {
    alert("Vui lòng đăng nhập để mua hàng");
    navigate("/login");
    return;
  }

  if (selectedCartItems.length === 0) {
    alert("Vui lòng chọn ít nhất 1 sản phẩm");
    return;
  }

  // Chuẩn bị dữ liệu sản phẩm để truyền sang Checkout
  const productsForCheckout = selectedCartItems.map((item) => ({
    id: item.product_id,
    name: item.name,
    price: item.price,
    display_price: item.price,
    quantity: item.quantity,
    thumbnail: item.product_thumbnail,
    selectedSize: item.size_id,
    selectedSizeName: item.size || "Không có",
  }));

  // Navigate sang trang Checkout với dữ liệu
  navigate("/checkout", {
    state: {
      products: productsForCheckout,
      fromCart: true,
      selectedCoupons: selectedCoupons,
    },
  });
};
  return (
    <div className="cart-container">
      <div className="cart-wrapper">
        <div className="cart-header">
          <ShoppingCartOutlined className="cart-header-icon" />
          <h1 className="cart-title">Giỏ Hàng</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCartOutlined className="empty-cart-icon" />
            <p>Giỏ hàng của bạn đang trống</p>
            <button onClick={() => navigate("/")}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              <div className="cart-select-all">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="checkbox-label">
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <button
                    className="delete-selected-btn"
                    onClick={() => {
                      const remaining = cartItems.filter(
                        (item) => !selectedItems.includes(item.id)
                      );
                      setCartItems(remaining);
                      setSelectedItems([]);
                      localStorage.setItem("cart", JSON.stringify(remaining));
                      window.dispatchEvent(new Event("cartUpdated"));
                    }}
                  >
                    <Trash2 size={16} />
                    Xóa ({selectedItems.length})
                  </button>
                )}
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`cart-item ${
                    selectedItems.includes(item.id) ? "selected" : ""
                  }`}
                >
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </label>

                  <img
                    src={`${API_BASE_URL}${item.product_thumbnail}`}
                    alt={item.name}
                    crossOrigin="anonymous"
                    className="item-image"
                  />

                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">{formatPrice(item.price)} ₫</p>
                    {item.size && (
                      <p className="item-size">Size: {item.size}</p>
                    )}
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleDecreaseQuantity(item.id)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncreaseQuantity(item.id)}>
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      <span className="total-label">Thành tiền:</span>
                      <span className="total-price">
                        {formatPrice(item.price * item.quantity)} ₫
                      </span>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Tóm tắt đơn hàng</h2>

              <div className="selected-info">
                <p>Đã chọn {selectedItems.length} sản phẩm</p>
              </div>

              <div className="coupon-section">
                <button
                  className="select-coupon-btn"
                  onClick={handleOpenCouponModal}
                  disabled={selectedItems.length === 0}
                >
                  <Tag size={18} />
                  Nhập mã giảm giá
                </button>

                {selectedCoupons.length > 0 && (
                  <div className="selected-coupons">
                    <p>Mã đã chọn:</p>
                    {selectedCoupons.map((code) => {
                      const coupon = availableCoupons.valid.find(
                        (c) => c.code === code
                      );
                      return (
                        <div key={code} className="selected-coupon-item">
                          <span className="coupon-code-badge">{code}</span>
                          
                          {coupon && (
                            <span className="coupon-desc">
                              {coupon.description}
                            </span>
                          )}
                          <button
                            className="remove-coupon-btn"
                            onClick={() => handleRemoveCoupon(code)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)} ₫</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(discount)} ₫</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)} ₫</span>
              </div>

              {verifyError && <p className="error-text">{verifyError}</p>}

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={loadingCheckout || selectedItems.length === 0}
              >
                <ShoppingBag size={18} />
                {loadingCheckout
                  ? "Đang xử lý..."
                  : `Mua hàng (${selectedItems.length})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {showCouponModal && (
        <CouponModal
          availableCoupons={availableCoupons}
          selectedCoupons={selectedCoupons}
          loading={loadingCoupons}
          onApplyCoupons={handleApplyCoupons}
          onClose={() => setShowCouponModal(false)}
        />
      )}
    </div>
  );
}

export default Cart;

