import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, notification, Popconfirm } from "antd";
import { useState } from "react";

function DeleteCategory(props) {
  const { record, onReload } = props;
  const [loading, setLoading] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();
  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch(`http://localhost:8090/category/${record.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete thất bại");

      notiApi.success({
        message: "Xoá thành công",
        description: `Đã xoá danh mục: ${record.fullname}`,
      });
      onReload();
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
      <Popconfirm title="Sure to delete?" onConfirm={handleDelete}>
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

export default DeleteCategory;
