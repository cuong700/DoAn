import { useState } from "react";
import { useDispatch } from "react-redux"; // Import both useDispatch and useSelector from 'react-redux'
import { useNavigate } from "react-router-dom";
import { setCookie } from "../../helpers/cookie"; // Corrected import path
import { checkLogin } from "../../actions/login"; // Corrected import path
import styles from "./styles.module.css";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
    console.log("Value of phone number:", e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    console.log("Value of password:", e.target.value);
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
        "http://localhost:8090/api/v1/users/login",
        userData
      );
      console.log("Response from API:", response.data);
      const data = response.data;

      setTimeout(() => {
        navigate("/");
        dispatch(checkLogin(true));
        setCookie("token", data.token, 1);
        setCookie("name", data.user_name, 1);
        setCookie("userid", data.user_id, 1);
        setCookie("phone", data.phone_number, 1);
        setCookie("address", data.address, 1);
        setCookie("date", data.date, 1);
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
      <div className={styles.login}>
        <div className={styles.loginbox}>
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.userbox}>
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                required
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
            </div>
            <div className={styles.userbox}>
              <label>Password</label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <button
              className={styles.submit}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
