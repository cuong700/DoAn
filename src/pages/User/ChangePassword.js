import React, { useState } from "react";
import { Modal, Input, notification } from "antd";
import axios from "axios";
import { getCookie } from "../../helpers/cookie";
import API_BASE_URL from '../../config/api';

export default function ChangePasswordModal({ 
  open, 
  onClose, 
  userData,
  onSuccess 
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();

  // Reset form khi đóng modal
  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setRePassword("");
    onClose();
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async () => {
    // Validate
    if (!oldPassword) {
      notiApi.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng nhập mật khẩu cũ",
        placement: "topRight",
      });
      return;
    }

    if (!newPassword || !rePassword) {
      notiApi.warning({
        message: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ mật khẩu mới",
        placement: "topRight",
      });
      return;
    }

    if (newPassword !== rePassword) {
      notiApi.error({
        message: "Lỗi xác nhận",
        description: "Mật khẩu nhập lại không khớp",
        placement: "topRight",
      });
      return;
    }

    if (newPassword.length < 3) {
      notiApi.warning({
        message: "Mật khẩu không hợp lệ",
        description: "Mật khẩu phải có ít nhất 3 ký tự",
        placement: "topRight",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = getCookie("token");
      const phone = userData.phone_number;

      // Bước 1: Kiểm tra mật khẩu cũ
      await axios.post(
        `${API_BASE_URL}/api/v1/users/user/verify-password?phoneNumber=${phone}&password=${oldPassword}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Bước 2: Đổi mật khẩu mới
      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/users/user/details/${userData.id}`,
        {
          password: newPassword,
          retype_password: rePassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      notiApi.success({
        message: "Thành công",
        description: "Đổi mật khẩu thành công",
        placement: "topRight",
        duration: 2,
      });

      // Callback khi thành công
      if (onSuccess && res.data) {
        onSuccess(res.data);
      }

      handleClose();
    } catch (err) {
      notiApi.error({
        message: "Đổi mật khẩu thất bại",
        description:
          err?.response?.data?.message || "Mật khẩu cũ không chính xác",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setTimeout(() => {
        setIsChangingPassword(false);
      }, 1000);
    }
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Đổi mật khẩu"
        open={open}
        onCancel={handleClose}
        className="dark-modal"
        key={open ? "open" : "closed"}
        footer={[
          <button
            key="submit"
            type="button"
            className="btn-submit"
            onClick={handleChangePassword}
            disabled={isChangingPassword}
          >
            {isChangingPassword ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>,
        ]}
      >
        <div style={{ padding: "20px 0" }}>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#e5e5e5",
              }}
            >
              Mật khẩu cũ <span style={{ color: "red" }}>*</span>
            </label>
            <Input.Password
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Nhập mật khẩu cũ"
              size="large"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#e5e5e5",
              }}
            >
              Mật khẩu mới <span style={{ color: "red" }}>*</span>
            </label>
            <Input.Password
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới"
              size="large"
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#e5e5e5",
              }}
            >
              Nhập lại mật khẩu mới <span style={{ color: "red" }}>*</span>
            </label>
            <Input.Password
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              size="large"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}