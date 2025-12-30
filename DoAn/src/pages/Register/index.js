import { useState } from "react";

import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import axios from "axios";

function Register() {
  const navigate = useNavigate();
 

  const [fullname, setFullname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isLoading, setIsLoading] = useState(false); // State to track loading status

  // Set default values for google_account_id and role_id
  const googleAccountId = 0;
  const roleId = 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when submitting

    if (password !== retypePassword) {
      alert("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const userData = {
      fullname: fullname,
      phone_number: phoneNumber,
      address: address,
      password: password,
      retype_password: retypePassword,
      date_of_birth: dateOfBirth,
      facebook_account_id: googleAccountId,
      google_account_id: googleAccountId,
      role_id: roleId,
    };

    try {
      const response = await axios.post(
        "http://localhost:8090/api/v1/users/register",
        userData
      );
      console.log("Response from API:", response.data);
      // const data = response.data;
      setTimeout(() => {
        alert("Registration successful!");
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Error posting to API:", error);
      alert("Registration failed: ", error);
      setIsLoading(false); 
    }
  };

  return (
    <div className={styles.register}>
      <div className={styles.registerbox}>
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.userbox}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullname"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>
          <div className={styles.userbox}>
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className={styles.userbox}>
            <label>Address</label>
            <input
              type="text"
              name="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className={styles.userbox}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.userbox}>
            <label>Retype Password</label>
            <input
              type="password"
              name="retype_password"
              required
              value={retypePassword}
              onChange={(e) => setRetypePassword(e.target.value)}
            />
          </div>
          <div className={styles.userbox}>
            <label>Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <button className={styles.submit} type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
