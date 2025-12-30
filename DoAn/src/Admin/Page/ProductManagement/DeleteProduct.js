import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, notification, Popconfirm } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";

function DeleteProduct(props) {
  const { record, onReload } = props;
  const [loading, setLoading] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const token = getCookie("token");

      const res = await fetch(
        `http://localhost:8090/api/v1/products/admin/delete/${record.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Delete thất bại");

      notiApi.success({
        message: "Xoá thành công",
        description: `Đã xoá sản phẩm: ${record.name}`,
      });

      setTimeout(() => {
        onReload();
      }, 500);
    } catch (error) {
      console.error(error);
      message.error("Xoá thất bại!");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {contextHolder}
      <Popconfirm
        title="Bạn chắc chắn muốn xoá?"
        onConfirm={handleDelete}
        okText="Xoá"
        cancelText="Huỷ"
      >
        <Button
          size="small"
          type="text"
          style={{ color: "#ff4d4f" }}
          icon={<DeleteOutlined />}
        />
      </Popconfirm>
    </>
  );
}

export default DeleteProduct;
