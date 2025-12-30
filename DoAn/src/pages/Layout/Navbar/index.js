import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import {
  DownOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { useEffect, useState } from "react";
import { Badge } from "antd";

function Navbar() {
  const [category, setCategory] = useState([]);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);


  useEffect(() => {
    fetch("http://localhost:8090/api/v1/categories/public/search")
      .then((res) => res.json())
      .then((res) => {
        
        const categories = res?.data?.content || [];

        const items = categories
          .filter((item) => item.active === true)
          .map((item) => ({
            key: item.id.toString(),
            label: (
              <div onClick={() => handleCategoryClick(item.id)}>
                {item.name}
              </div>
            ),
          }));

        setCategory(items);
      })
      .catch((err) => console.error("Fetch category error:", err));
  }, []);

  // Xử lý khi click vào category
  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
  };

  // Xử lý tìm kiếm
  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${keyword}`);
    }
  };

  //load cart
  const loadCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(totalQty);
  };

  useEffect(() => {
    loadCartCount();

    // lắng nghe khi cart thay đổi
    window.addEventListener("cartUpdated", loadCartCount);

    return () => {
      window.removeEventListener("cartUpdated", loadCartCount);
    };
  }, []);



  return (
    <>
      <header className="navbar">
        <ul className="navbar__menu">
          <li>
            <NavLink to="/"> HOME </NavLink>
          </li>
          <li>
            <NavLink to="/about-us"> ABOUT US </NavLink>
          </li>
          <li>
            <NavLink to="/contact"> CONTACT </NavLink>
          </li>
          <li className="dropdown">
            <Dropdown menu={{ items: category }} placement="bottomLeft">
              <NavLink onClick={(e) => e.preventDefault()}>
                <Space>
                  PRODUCT <DownOutlined />
                </Space>
              </NavLink>
            </Dropdown>
          </li>
        </ul>
        <div className="navbar__right">
          <form className="navbar__search" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button type="submit"> Search </button>
          </form>
          <div className="navbar__icons-cart">
            <NavLink to="/cart" className="navbar__cart">
              <Badge count={cartCount} size="small">
                <ShoppingCartOutlined className="navbar_icon" />
              </Badge>

            </NavLink>
          </div>
          <div className="navbar__icons-user">
            <NavLink to="/User" className="navbar__user">
              <UserOutlined className="navbar_icon" />
              User
            </NavLink>
          </div>
        </div>
      </header>
    </>
  );
}

export default Navbar;