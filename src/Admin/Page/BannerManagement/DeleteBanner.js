import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, notification, Popconfirm } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";

function DeleteBanner({ record, onReload }) {
  const [loading, setLoading] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const res = await fetch(
        `http://localhost:8090/api/v1/banners/admin/delete/${record.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Xoá thất bại");

      notiApi.success({
        message: "Xoá thành công",
        description: `Đã xoá banner: ${record.title}`,
      });

      setTimeout(() => onReload(), 500);
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
        title="Bạn chắc chắn muốn xoá banner này?"
        onConfirm={handleDelete}
        okText="Xoá"
        cancelText="Huỷ"
      >
        <Button
          size="small"
          type="text"
          loading={loading}
          style={{ color: "#ff4d4f" }}
          icon={<DeleteOutlined />}
        />
      </Popconfirm>
    </>
  );
}

export default DeleteBanner;
