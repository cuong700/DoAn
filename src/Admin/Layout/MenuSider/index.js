import {
  BarChartOutlined,
  BarsOutlined,
  CommentOutlined,
  GiftOutlined,
  ProductOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

function MenuSider() {
  const items = [
    {
      key: "Thống kê",
      label: <Link to="/admin">Thống kê</Link>,
      icon: <BarChartOutlined />,
    },
    {
      key: "Quản lí người dùng",
      label: <Link to="user-accounts">Quản lí người dùng</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "Quản lí danh mục",
      label: <Link to="category-management">Quản lí danh mục</Link>,
      icon: <BarsOutlined />,
    },
    {
      key: "Quản lí sản phẩm",
      label: <Link to="product-management">Quản lí sản phẩm</Link>,
      icon: <ProductOutlined />,
    },
    {
      key: "Quản lí bình luận",
      label: <Link to="comment-management">Quản lí bình luận</Link>,
      icon: <CommentOutlined />,
    },
    {
      key: "Quản lí mã giảm giá",
      label: <Link to="coupon-management">Quản lí mã giảm giá</Link>,
      icon: <GiftOutlined />,
    },
  ];
  return (
    <>
      <Menu
        mode="inline"
        items={items}
        defaultSelectedKeys={["Thống kê"]}
        defaultOpenKeys={["Thống kê"]}
      />
    </>
  );
}

export default MenuSider;
