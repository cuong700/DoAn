import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
  DownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { useEffect, useState } from "react";

function Navbar() {
  const [category, setCategory] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8090/category")
      .then((res) => res.json())
      .then((data) => {
        const newItems = data.map((item) => ({
          key: item.id.toString(),
          label: (
            <div onClick={() => navigate(`/category/${item.id}`)}>
              {item.name}
            </div>
          ),
        }));
        setCategory(newItems);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <header className="navbar">
        <ul className="navbar__menu">
          <li>
            <NavLink to="/">HOME</NavLink>
          </li>
          <li>
            <NavLink to="/about-us">ABOUT US</NavLink>
          </li>
          <li>
            <NavLink to="/contact">CONTACT</NavLink>
          </li>

          <li className="dropdown">
            <Dropdown menu={{ items: category }}>
              <NavLink onClick={(e) => e.preventDefault()}>
                <Space>
                  PRODUCT
                  <DownOutlined />
                </Space>
              </NavLink>
            </Dropdown>
          </li>
        </ul>

        <div className="navbar__right">
          <div className="navbar__search">
            <input type="text" placeholder="Search" />
            <button>Search</button>
          </div>

          <div className="navbar__icons-cart">
            <ShoppingCartOutlined />
          </div>
          

          <div className="navbar__icons-user">
            <UserOutlined />
            <span className="navbar__user">User</span>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;
