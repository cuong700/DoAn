import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, notification, Popconfirm } from "antd";
import { useState } from "react";

function DeleteUser(props) {
  const { record, onReload } = props;

  const [loading, setLoading] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();
  const handleDelete = async () => {
    //async để gửi lên và đợi 1 kết quả
    try {
      setLoading(true);

      const res = await fetch(`https://dummyjson.com/users/${record.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete thất bại");

      notiApi.success({
        message: "Xoá thành công",
        description: `Đã xoá người dùng: ${record.fullname}`,
      });

      onReload(); // reload lại bảng
    } catch (err) {
      console.error(err);
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
          style={{ color: "#ff4d4f" }}
          icon={<DeleteOutlined />}
        />
      </Popconfirm>
    </>
  );
}
export default DeleteUser;
