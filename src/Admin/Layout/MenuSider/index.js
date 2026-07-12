import {
  BarChartOutlined,
  BarsOutlined,
  FileTextOutlined,
  GiftOutlined,
  PictureOutlined,
  ProductOutlined,
  SettingOutlined,
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
      key: "Quản lí khách hàng",
      label: <Link to="user-accounts">Quản lí khách hàng</Link>,
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
      key: "Quản lí mã giảm giá",
      label: <Link to="coupon-management">Quản lí mã giảm giá</Link>,
      icon: <GiftOutlined />,
    },
    {
      key: "Quản lí hoá đơn",
      label: <Link to="invoice-management">Quản lí hoá đơn</Link>,
      icon: <FileTextOutlined />,
    },
    {
      key: "Quản lí banner",
      label: <Link to="banner-management">Quản lí banner</Link>,
      icon: <PictureOutlined />,
    },
    {
      key: "Cấu hình cửa hàng",
      label: <Link to="shop-config">Cấu hình cửa hàng</Link>,
      icon: <SettingOutlined />,
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
