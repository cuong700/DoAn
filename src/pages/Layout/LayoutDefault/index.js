import { useEffect } from "react";

import { NavLink } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import "./nav.css";
import { getCookie } from "../../../helpers/cookie";
import Navbar from "../Navbar";
import Footer from "../Footer";

// const { Header, Footer, Content, Sider } = Layout;

const LayoutDefault = () => {
  const check = useSelector((state) => state.Checkstatus.Checking);
  const Status = check[0]?.check;
  console.log(Status);

  const handleCheckClick = () => {
    console.log(Status);
  };

  const [isLogin, setIsLogin] = useState(null);

  useEffect(() => {
    const isLogin = getCookie("isLogin");
    const loginStatus = isLogin === "true";
    setIsLogin(loginStatus);
  });



  return (
    <div className="layout">
      {/* <button  onClick={checkisLogin}></button> */}

      <header className="custom-header">
        <div className="hop">
          <div className="innerwrap">
            <div className="box1">
              <div className="logo">
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/3/37/Jumpman_logo.svg/1200px-Jumpman_logo.svg.png"
                  alt="Logo"
                />
              </div>
            </div>
            <div className="box2">
              <div className="tieude">
                <div className="item">
                  {isLogin ? (
                    <NavLink to="/logout">Đăng xuất</NavLink>

                  ) : (
                    <>
                      <NavLink to="/login" style={{ marginRight: "9px" }}>
                         Đăng nhập
                      </NavLink>
                      <NavLink to="/register">Đăng ký</NavLink>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Navbar />

      <Outlet />
      
      <Footer />
    </div>
  );
};

export default LayoutDefault;
