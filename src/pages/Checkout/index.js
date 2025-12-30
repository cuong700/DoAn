
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Checkout.css";
import { getCookie } from "../../helpers/cookie";


function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const productData = location.state?.product;

  const [formData, setFormData] = useState({
    fullname: "",
    phone_number: "",
    email: "",
    address: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    hamlet: "",
    note: "",
    payment_method: "COD",
    size_id: productData?.selectedSize || null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  }, [productData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.fullname || !formData.phone_number) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!formData.address || formData.address.trim().length < 10) {
      setError("Vui lòng nhập địa chỉ giao hàng đầy đủ (tối thiểu 10 ký tự)");
      return;
    }

    if (!productData || !formData.size_id) {
      setError("Không tìm thấy thông tin sản phẩm hoặc size");
      return;
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
        "COD": 1,
        "MOMO": 2,
      };

      // Chuẩn bị dữ liệu theo đúng format backend
      const orderData = {
        fullname: formData.fullname.trim(),
        phone_number: formData.phone_number.trim(),
        address: formData.address.trim(),
        payment_method_id: paymentMethodMap[formData.payment_method] || 1,
        // note: formData.note?.trim() || null,
        items: [
          {
            product_id: parseInt(productData.id),
            size_id: parseInt(formData.size_id),
            quantity: parseInt(productData.quantity) || 1,
          },
        ],
      };

      // Thêm các field optional nếu có
      if (formData.email && formData.email.trim()) {
        orderData.email = formData.email.trim();
      }
      
      if (formData.note && formData.note.trim()) {
        orderData.note = formData.note.trim();
      }

      if (formData.province && formData.province.trim()) {
        orderData.province = formData.province.trim();
      }

      if (formData.district && formData.district.trim()) {
        orderData.district = formData.district.trim();
      }

      if (formData.ward && formData.ward.trim()) {
        orderData.ward = formData.ward.trim();
      }

      if (formData.street && formData.street.trim()) {
        orderData.street = formData.street.trim();
      }

      if (formData.hamlet && formData.hamlet.trim()) {
        orderData.hamlet = formData.hamlet.trim();
      }


      // Bước 1: Tạo đơn hàng
      const response = await fetch(
        "http://localhost:8090/api/v1/orders/user/create",
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

        // Bước 2: Nếu chọn MoMo, gọi API payment
        if (formData.payment_method === "MOMO" && orderId) {
          console.log("💳 Processing MoMo payment...");
          
          try {
            const paymentResponse = await fetch(
              `http://localhost:8090/api/v1/payment/user/create/${orderId}?gateway=momo`,
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
              setError(paymentResult.message || "Không thể tạo thanh toán MoMo");
            }
          } catch (paymentErr) {
            setError("Có lỗi khi tạo thanh toán MoMo");
          }
        } else {
          // COD hoặc Bank Transfer
          alert(result.message || "Đặt hàng thành công!");
          navigate("/");
        }
      } else {
        setError(result.message || "Đặt hàng thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!productData) {
    return (
      <div className="checkout-container">
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Không tìm thấy thông tin sản phẩm</p>
          <button onClick={() => navigate(-1)} style={{ padding: "10px 20px", cursor: "pointer" }}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const quantity = productData.quantity || 1;
  const unitPrice = productData.display_price || productData.price;
  const totalPrice = unitPrice * quantity;

  return (
    <div className="checkout-container">
      <h1>Thanh toán đơn hàng</h1>

      {error && (
        <div style={{ 
          padding: "15px", 
          backgroundColor: "#fee", 
          color: "#c33",
          borderRadius: "5px",
          marginBottom: "20px",
          border: "2px solid #fcc",
          fontWeight: "bold"
        }}>
           {error}
        </div>
      )}

      <div className="checkout-content">
        <div className="product-summary">
          <h2>Sản phẩm đã chọn</h2>
          <div className="product-info">
            <img
              src={`http://localhost:8090${productData.thumbnail}`}
              alt={productData.name}
              crossOrigin="anonymmous"
              style={{ width: 100, height: 100, objectFit: "cover" }}
            />
            <div>
              <h3>{productData.name}</h3>
              <p className="price">{unitPrice.toLocaleString("vi-VN")} đ</p>
              <p>Size: {productData.selectedSizeName || formData.size_id}</p>
              <p>Số lượng: {quantity}</p>
            </div>
          </div>
          <div className="total">
            <strong>Tổng tiền: </strong>
            <span className="total-price">{totalPrice.toLocaleString("vi-VN")} đ</span>
          </div>
          {quantity > 1 && (
            <div className="price-breakdown">
              <small>
                {unitPrice.toLocaleString("vi-VN")} đ × {quantity} = {totalPrice.toLocaleString("vi-VN")} đ
              </small>
            </div>
          )}
        </div>

        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Thông tin giao hàng</h2>

          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại *</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập email (không bắt buộc)"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Địa chỉ giao hàng *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Số nhà, tên đường"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tỉnh/Thành phố</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                placeholder="VD: Hà Nội"
              />
            </div>

            <div className="form-group">
              <label>Quận/Huyện</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="VD: Quận Đống Đa"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phường/Xã</label>
              <input
                type="text"
                name="ward"
                value={formData.ward}
                onChange={handleChange}
                placeholder="VD: Phường Láng Hạ"
              />
            </div>

            <div className="form-group">
              <label>Đường</label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="VD: Đường Láng"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Phương thức thanh toán *</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              required
            >
              <option value="COD">Thanh toán khi nhận hàng (COD)</option>
              <option value="MOMO">Thanh toán qua MoMo</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-back"
              onClick={() => navigate(-1)}
            >
              Quay lại
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Checkout;