import React, { useEffect, useState } from "react";
import axios from "axios";
import "./User.css";
import { getCookie } from "../../../helpers/cookie";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { ListOrders } from "./ListOrders";


export default function User() {
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // change password flow
  const [changePass, setChangePass] = useState(false);
  const [checkPass, setCheckPass] = useState("");
  const [checkPassStatus, setCheckPassStatus] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const navigate = useNavigate();


  const buildInitialFromCookies = () => {
    const uid = getCookie("userid") || null;
    const fullname = getCookie("fullname") || "";
    const phone_number = getCookie("phone") || "";
    const address = getCookie("address") || "";
    const roleName = getCookie("role") || ""; // optional: set during manual login
    if (!uid && !fullname && !phone_number && !address && !roleName)
      return null;
    return {
      id: uid,
      fullname,
      phone_number,
      address,
      role: { id: null, name: roleName || "USER" },
    };
  };


  const [userData, setUserData] = useState(() => buildInitialFromCookies());

 
  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const parts = token.split(".");
      if (parts.length < 2) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // load user (if backend available) and overwrite cookie fallback
  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      try {
        const userId = getCookie("userid");
        const token = getCookie("token");

        if (!userId) {
          // no login -> stop loading but keep cookie fallback (if any)
          if (mounted) {
            message.info("Chưa đăng nhập");
            setIsLoading(false);
          }
          return;
        }

        const res = await axios.get(
          `http://localhost:8090/api/v1/users/${userId}`,
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
          // keep any cookie fallback, but notify
          message.error(
            "Lỗi khi tải thông tin người dùng (sẽ dùng dữ liệu local nếu có)"
          );
          setIsLoading(false);
        }
      }
    }

    fetchUser();
    return () => {
      mounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChangePass = (e) => setCheckPass(e.target.value);
  const handleInputChangePassword = (e) => setNewPassword(e.target.value);
  const handleInputChangeRetype_password = (e) => setRePassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getCookie("token");
      if (!userData?.id) {
        message.error("Không có user id");
        return;
      }
      await axios.put(
        `http://localhost:8090/api/v1/users/details/${userData.id}`,
        userData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Cập nhật thành công");
      setEditMode(false);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật");
    }
  };

  const handleSubmitCheckPass = async (e) => {
    e.preventDefault();
    try {
      const token = getCookie("token");
      const phone = getCookie("phone");
      await axios.post(
        `http://localhost:8090/api/v1/users/checkPass`,
        { pass: checkPass, phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Mật khẩu cũ chính xác");
      setCheckPassStatus(true);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || "Sai mật khẩu hoặc lỗi server";
      message.error(msg);
    }
  };

  const handleSubmitNewPassword = async () => {
    if (newPassword !== rePassword) {
      message.warning("Mật khẩu nhập lại không khớp");
      return;
    }
    try {
      const token = getCookie("token");
      const phone = getCookie("phone");
      await axios.put(
        `http://localhost:8090/api/v1/users/changePass`,
        { phone, newPass: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success("Đổi mật khẩu thành công");
      setChangePass(false);
      setCheckPassStatus(false);
      setNewPassword("");
      setRePassword("");
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi đổi mật khẩu");
    }
  };

  // determine role from token payload if present
  const token = getCookie("token");
  const tokenPayload = parseJwt(token);

  const tokenRoleName = (() => {
    if (!tokenPayload) return null;
    if (tokenPayload.role) return tokenPayload.role;
    if (tokenPayload.roles) {
      if (Array.isArray(tokenPayload.roles)) return tokenPayload.roles[0];
      return tokenPayload.roles;
    }
    if (tokenPayload.authorities) {
      if (Array.isArray(tokenPayload.authorities))
        return tokenPayload.authorities[0];
      return tokenPayload.authorities;
    }
    return null;
  })();

  const isAdmin =
    (tokenRoleName && String(tokenRoleName).trim().toLowerCase() === "admin") ||
    (!!userData?.role?.name &&
      String(userData.role.name).trim().toLowerCase() === "admin");

  // render: show immediately if cookie fallback exists; otherwise wait for fetch
  if (isLoading && !userData) {
    return (
      <div className="body-user">
        <div className="box box-account">
          <h2>Thông tin tài khoản</h2>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
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
                      setCheckPass("");
                      setCheckPassStatus(false);
                    }}
                  >
                    Hủy
                  </button>
                </div>

                <label>
                  Họ và tên:
                  <input
                    type="text"
                    name="fullname"
                    value={userData?.fullname || ""}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Số điện thoại:
                  <input
                    type="text"
                    name="phone_number"
                    value={userData?.phone_number || ""}
                    onChange={handleInputChange}
                  />
                </label>

                <label>
                  Địa chỉ:
                  <input
                    type="text"
                    name="address"
                    value={userData?.address || ""}
                    onChange={handleInputChange}
                  />
                </label>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setChangePass(true);
                      setCheckPassStatus(false);
                    }}
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </form>

              {changePass && !checkPassStatus && (
                <form onSubmit={handleSubmitCheckPass} className="pass-check">
                  <div>Nhập mật khẩu cũ</div>
                  <input
                    type="password"
                    value={checkPass}
                    onChange={handleInputChangePass}
                  />
                  <button type="submit">Tiếp tục</button>
                </form>
              )}

              {checkPassStatus && (
                <div className="pass-new">
                  <div>Nhập mật khẩu mới</div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={handleInputChangePassword}
                  />

                  <div>Nhập lại mật khẩu</div>
                  <input
                    type="password"
                    value={rePassword}
                    onChange={handleInputChangeRetype_password}
                  />

                  <button type="button" onClick={handleSubmitNewPassword}>
                    Đổi mật khẩu
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="inner-wrap">
              <div className="inner-l">
                <div>
                  <i className="fa-regular fa-circle-user" />{" "}
                  {userData?.fullname || "Loading..."}
                </div>
                <div className="view-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(true);
                      setChangePass(false);
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
                {/* <div>Vai trò: {userData?.role?.name || "-"}</div> */}
              </div>
            </div>
          )}
        </div>

        <ListOrders />
      </div>
    </>
  );
}
