import React, { useEffect, useState } from "react";
import axios from "axios";
import "./User.css";
import { getCookie } from "../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { message, notification, Input } from "antd";
import { ListOrders } from "./ListOrders/ListOrders";
import ChangePassword from "./ChangePassword";
import API_BASE_URL from '../../config/api';

export default function User() {
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // States cho modal đổi mật khẩu
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  const [notiApiEdit, contextHolderEdit] = notification.useNotification();

  // ===== HELPER: Format ngày sinh =====
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  // ===== EFFECT: Tải thông tin người dùng từ API =====
  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const token = getCookie("token");

        if (!token) {
          if (mounted) {
            message.info("Chưa đăng nhập");
            setIsLoading(false);
          }
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/v1/users/user/detail-self`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (mounted) {
          const data = res.data || {};
          data.role = data.role || { id: null, name: "USER" };
          setUserData(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("fetchUser error:", err);
        if (mounted) {
          message.error("Lỗi khi tải thông tin người dùng");
          setIsLoading(false);
          if (err.response?.status === 401) {
            navigate("/login");
          }
        }
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ===== HANDLERS =====

  // Xử lý thay đổi input trong form chỉnh sửa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form cập nhật thông tin user
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getCookie("token");

      if (!userData?.id) {
        message.error("Không có user id");
        return;
      }

      const res = await axios.patch(
        `${API_BASE_URL}/api/v1/users/user/details/${userData.id}`,
        {
          fullname: userData.fullname,
          address: userData.address,
          date_of_birth: userData.date_of_birth,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data) {
        setUserData(res.data);
      }

      notiApiEdit.success({
        message: "Cập nhật thành công",
        description: "Thông tin cá nhân đã được cập nhật",
        placement: "topRight",
        duration: 2,
      });

      setEditMode(false);
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || "Lỗi khi cập nhật";

      notiApiEdit.error({
        key: "update-user",
        message: "Cập nhật thất bại",
        description: errorMsg,
        placement: "topRight",
        duration: 3,
      });
    }
  };

  // Mở modal đổi mật khẩu
  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
  };

  // Đóng modal đổi mật khẩu
  const handleCloseChangePasswordModal = () => {
    setShowChangePasswordModal(false);
  };

  // Callback khi đổi mật khẩu thành công
  const handlePasswordChangeSuccess = (newData) => {
    if (newData) {
      setUserData(newData);
    }
  };

  // ===== XÁC ĐỊNH ROLE ADMIN =====
  const isAdmin = userData?.role?.name === "ADMIN";

  // ===== RENDER =====

  if (isLoading) {
    return (
      <div className="body-user">
        <div className="box box-account">
          <h2>Thông tin tài khoản</h2>
          <div>Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="body-user">
        <div className="box box-account">
          <h2>Thông tin tài khoản</h2>
          <div style={{ color: "white" }}>
            Không tìm thấy thông tin người dùng
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {contextHolderEdit}
      <div className="body-user">
        <div className="box box-account">
          <h2>Thông tin tài khoản</h2>

          {editMode ? (
            <>
              <form onSubmit={handleSubmit} className="user-form">
                <div className="form-actions">
                  <button type="submit">Lưu thay đổi</button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                    }}
                  >
                    Hủy
                  </button>
                </div>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    color: "#e5e5e5",
                    fontWeight: "500",
                  }}
                >
                  Họ và tên:
                  <Input
                    name="fullname"
                    value={userData?.fullname || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    size="large"
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    color: "#e5e5e5",
                    fontWeight: "500",
                  }}
                >
                  Địa chỉ:
                  <Input
                    name="address"
                    value={userData?.address || ""}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ"
                    size="large"
                  />
                </label>

                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    color: "#e5e5e5",
                    fontWeight: "500",
                  }}
                >
                  Ngày sinh:
                  <Input
                    type="date"
                    name="date_of_birth"
                    value={userData?.date_of_birth || ""}
                    onChange={handleInputChange}
                    size="large"
                  />
                </label>

                <div className="form-actions">
                  <button type="button" onClick={handleOpenChangePasswordModal}>
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="inner-wrap">
              <div className="inner-l">
                <div>
                  <i className="fa-regular fa-circle-user" />{" "}
                  {userData?.fullname || "Chưa có tên"}
                </div>
                <div className="view-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(true);
                    }}
                  >
                    Chỉnh sửa thông tin
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      className="btn-admin"
                      onClick={() => navigate("/admin")}
                    >
                      Dashboard Admin
                    </button>
                  )}
                </div>
              </div>

              <div className="inner-r">
                <div>SĐT: {userData?.phone_number || "-"}</div>
                <div>Địa chỉ: {userData?.address || "-"}</div>
                <div>Ngày sinh: {formatDate(userData?.date_of_birth)}</div>
              </div>
            </div>
          )}
        </div>

        <ListOrders />
      </div>

      {/* Modal đổi mật khẩu */}
      <ChangePassword
        open={showChangePasswordModal}
        onClose={handleCloseChangePasswordModal}
        userData={userData}
        onSuccess={handlePasswordChangeSuccess}
      />
    </>
  );
}
