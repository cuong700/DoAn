import { useEffect, useState } from "react";
import "./Cart.css";
import { ShoppingBag, Plus, Minus, Trash2, Tag, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../../helpers/cookie";
import axios from "axios";
import { ShoppingCartOutlined } from "@ant-design/icons";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [couponError, setCouponError] = useState(null);

  const userId = getCookie("userid");

  // Format tiền VND
  const formatPrice = (value) => (value ? value.toLocaleString("vi-VN") : "0");

  // Tính tổng
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = 0;
  const total = subtotal - discount;

  // Load giỏ hàng từ API
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`http://localhost:8080/cart/${userId}`)
      .then((res) => setCartItems(res.data))
      .catch(() => console.log("Lỗi khi load cart"));
  }, [userId]);

  // Tăng giảm số lượng sản phẩm
  const handleIncreaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Xoá sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  return (
    <div className="cart-container">
      <div className="cart-wrapper">
        <div className="cart-header">
          <ShoppingCartOutlined className="cart-header-icon" />
          <h1 className="cart-title">Giỏ Hàng</h1>
        </div>

        {/* Khi giỏ hàng trống */}
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCartOutlined className="empty-cart-icon" />
            <p className="empty-cart-text">Giỏ hàng của bạn đang trống</p>
            <button
              className="empty-cart-button"
              onClick={() => navigate("/products")}
            >
              Tiếp Tục Mua Sắm
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items-section">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-details">
                    <div>
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">
                        {formatPrice(item.price)} VND
                      </p>
                    </div>

                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button
                          className="quantity-button"
                          onClick={() => handleDecreaseQuantity(item.id)}
                        >
                          <Minus />
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button
                          className="quantity-button"
                          onClick={() => handleIncreaseQuantity(item.id)}
                        >
                          <Plus />
                        </button>
                      </div>

                      <button
                        className="remove-button"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-section">
              <div className="summary-card">
                <h2 className="summary-title">Tóm Tắt Đơn Hàng</h2>

                <div className="coupon-section">
                  <label className="coupon-label">Mã Giảm Giá</label>

                  <div className="coupon-input-group">
                    <div className="coupon-input-wrapper">
                      <Tag className="coupon-icon" />
                      <input placeholder="Nhập mã giảm giá" />
                    </div>

                    <button className="coupon-apply-button">Áp Dụng</button>
                  </div>

                  {couponError && <p className="coupon-error">{couponError}</p>}

                  <div className="coupon-hint">
                    <p>Mã khả dụng: GIAM10K, GIAM50K, FREESHIP</p>
                  </div>
                </div>

                <div className="price-summary">
                  <div className="price-row">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)} VND</span>
                  </div>

                  {discount > 0 && (
                    <div className="price-row discount">
                      <span>Giảm giá</span>
                      <span>-{formatPrice(discount)} VND</span>
                    </div>
                  )}

                  <div className="price-row total">
                    <span>Tổng cộng</span>
                    <span className="price-value">
                      {formatPrice(total)} VND
                    </span>
                  </div>
                </div>

                <button className="checkout-button">
                  Tiến Hành Thanh Toán
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
