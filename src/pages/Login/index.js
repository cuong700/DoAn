import { useState } from "react";
import { useDispatch } from "react-redux"; // Import both useDispatch and useSelector from 'react-redux'
import { useNavigate } from "react-router-dom";
import { setCookie } from "../../helpers/cookie"; // Corrected import path
import { checkLogin } from "../../actions/login"; // Corrected import path
import "./Login.css";
import axios from "axios";
import API_BASE_URL from '../../config/api';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();//Gửi action lên Redux Store

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when submitting

    const userData = {
      phone_number: phoneNumber,
      password: password,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/users/login`,
        userData,
      );
      console.log("Response from API:", response.data);
      const data = response.data;

      setTimeout(() => {
        navigate("/");
        dispatch(checkLogin(true));
        setCookie("token", data.token, 1);
        setCookie("userid", data.user_id, 1);
        setCookie("isLogin", "true", 1);

        setIsLoading(false); // Set loading to false after navigation
        alert("Đăng nhập thành công", data.token, 1);
      }, 2000);
    } catch (error) {
      console.error("Error posting to API:", error);
      alert(" Đăng nhập lỗi", error);
      setIsLoading(false); // Set loading to false if there's an error
    }
  };

  return (
    <>
      <div className="login">
        <div className="loginbox">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="userbox">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                required
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
            </div>
            <div className="userbox">
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <button className="submit" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
