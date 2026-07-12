
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; 
import axios from "axios";
import API_BASE_URL from '../../config/api';

function Register() {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (password !== retypePassword) {
      setErrorMessage("Mật khẩu không khớp!");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự!");
      setIsLoading(false);
      return;
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage("Số điện thoại không hợp lệ!");
      setIsLoading(false);
      return;
    }

    const userData = {
      fullname: fullname.trim(),
      phone_number: phoneNumber.trim(),
      address: address.trim(),
      password: password,
      retype_password: retypePassword,
      date_of_birth: dateOfBirth,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/register`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.user) {
        alert(
          `Đăng ký thành công!\nChào mừng ${response.data.user.fullname}!`
        );
        
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      if (error.response) {
        const errorMsg = error.response.data?.message || error.response.data?.error;
        
        if (errorMsg) {
          setErrorMessage(errorMsg);
        } else if (error.response.status === 400) {
          setErrorMessage("Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại!");
        } else if (error.response.status === 409) {
          setErrorMessage("Số điện thoại đã được đăng ký!");
        } else {
          setErrorMessage("Đăng ký thất bại. Vui lòng thử lại!");
        }
      } else if (error.request) {
        setErrorMessage("Không thể kết nối đến server. Vui lòng kiểm tra kết nối!");
      } else {
        setErrorMessage("Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Đăng ký tài khoản</h2>
        
        {errorMessage && (
          <div className="error-box">
            ⚠️ {errorMessage}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Họ và tên *</label>
            <input
              className="input-field"
              type="text"
              name="fullname"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Số điện thoại *</label>
            <input
              className="input-field"
              type="tel"
              name="phone_number"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Địa chỉ *</label>
            <input
              className="input-field"
              type="text"
              name="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu *</label>
            <input
              className="input-field"
              type="password"
              name="password"
              required
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Nhập lại mật khẩu *</label>
            <input
              className="input-field"
              type="password"
              name="retype_password"
              required
              minLength="6"
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Ngày sinh *</label>
            <input
              className="input-field"
              type="date"
              name="date_of_birth"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <button 
            className="submit-btn" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </button>

          <div className="login-link-container">
            Đã có tài khoản?{" "}
            <span
              className="login-link"
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;