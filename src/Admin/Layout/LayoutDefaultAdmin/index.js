import {
  LogoutOutlined,
  MenuFoldOutlined,
  RightOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Input, Layout, message, Space } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import MenuSider from "../MenuSider";
import "./LayoutDefaultAdmin.css";
import logo from "../../images/logo.png";
import logoFold from "../../images/logo-fold.png";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { deleteCookie, getCookie } from "../../../helpers/cookie";
import withAuth from "../../ComponentsAdmin/HOC";

function LayoutDefault() {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const cookieName = getCookie("name");
    if (cookieName) {
      setUser(cookieName);
    }
  }, []);

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case "profile":
        navigate("/admin/profile");
        break;

      case "logout":
        deleteCookie("token");
        deleteCookie("name");
        deleteCookie("userid");
        deleteCookie("phone");
        deleteCookie("address");
        deleteCookie("date");
        deleteCookie("isLogin");

        message.success("Đăng xuất thành công");
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const menuItems = [
    {
      key: "info",
      disabled: true,
      // lấy tên từ cookie
      label: (
        <div className="admin-dropdown__profile">
          <Avatar
            style={{ backgroundColor: "black" }}
            icon={<UserOutlined />}
          />

          <div>
            <div className="admin-dropdown__name">{user || "Admin"}</div>
          </div>
        </div>
      ),
    },

    { type: "divider" },

    {
      key: "profile",
      label: (
        <div className="admin-dropdown__item">
          <Space>
            <UserOutlined />
            <span>Profile</span>
          </Space>
          <RightOutlined className="admin-dropdown__arrow" />
        </div>
      ),
    },

    {
      key: "logout",
      label: (
        <div className="admin-dropdown__item">
          <Space>
            <LogoutOutlined />
            <span>Logout</span>
          </Space>
          <RightOutlined className="admin-dropdown__arrow" />
        </div>
      ),
    },
  ];
  return (
    <>
      <Layout>
        <header className="header">
          <div
            className={
              "header__logo " + (collapsed && "header__logo-collapsed")
            }
          >
            <img src={collapsed ? logoFold : logo} alt="Logo" />
          </div>

          <div className="header__nav">
            <div
              className="header__collapse"
              onClick={() => setCollapsed(!collapsed)}
            >
              <MenuFoldOutlined />
            </div>

            <div className="header__right">
              <Dropdown
                menu={{ items: menuItems, onClick: handleMenuClick }}
                placement="bottomRight"
                trigger={["click"]}
              >
                <div className="header__avatar">
                  <Avatar
                    size={40}
                    style={{ backgroundColor: "black" }}
                    icon={<UserOutlined />}
                  />
                </div>
              </Dropdown>
            </div>
          </div>
        </header>

        <Layout>
          <Sider className="sider" theme="light" collapsed={collapsed}>
            <MenuSider />
          </Sider>

          <Content className="content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

export default withAuth(LayoutDefault);
