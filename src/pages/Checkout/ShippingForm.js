import React from "react";
import "./Checkout.css";

function ShippingForm({
  formData,
  onChange,
  onSubmit,
  onBack,
  loading,
  saveInfo,
  onSaveInfoChange,
  onClearSavedInfo,
}) {
  return (
    <form className="checkout-form" onSubmit={onSubmit}>
      <div className="form-header">
        <h2>Thông tin giao hàng</h2>

        {localStorage.getItem("shippingInfo") && (
          <button
            type="button"
            onClick={onClearSavedInfo}
            className="clear-info-btn"
          >
            Xóa thông tin đã lưu
          </button>
        )}
      </div>

      <div className="form-group">
        <label>Họ và tên *</label>
        <input
          type="text"
          name="fullname"
          value={formData.fullname}
          onChange={onChange}
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
            onChange={onChange}
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
            required
            onChange={onChange}
            placeholder="Nhập email"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Địa chỉ giao hàng *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={onChange}
          required
          placeholder="Địa chỉ cụ thể"
          rows="2"
        />
      </div>

      <div className="form-group">
        <label>Ghi chú</label>
        <textarea
          name="note"
          value={formData.note}
          onChange={onChange}
          placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Phương thức thanh toán *</label>
        <select
          name="payment_method"
          value={formData.payment_method}
          onChange={onChange}
          required
        >
          <option value="COD">Thanh toán khi nhận hàng (COD)</option>
          <option value="MOMO">Thanh toán qua MoMo</option>
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={saveInfo}
            onChange={onSaveInfoChange}
          />
          <span>Lưu thông tin giao hàng cho lần mua tiếp theo</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-back" onClick={onBack}>
          Quay lại
        </button>

        <button type="submit" className="btn-submit" disabled={loading} >
          {loading ? "Đang xử lý..." : "Đặt hàng"}
        </button>
      </div>
    </form>
  );
}

export default ShippingForm;
