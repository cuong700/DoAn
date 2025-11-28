import { BarsOutlined, CommentOutlined, ProductOutlined, UserOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

function MenuSider() {
  
  const items = [
    {
      key: "Quản lí người dùng",
      label: <Link to="/admin">Quản lí người dùng</Link>,
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
  ];
  return (
    <>
      <Menu
         mode="inline"
        items={items}
        defaultSelectedKeys={["Quản lí người dùng"]}
        defaultOpenKeys={["Quản lí người dùng"]} 
       
      />
    </>
  );
}

export default MenuSider;
