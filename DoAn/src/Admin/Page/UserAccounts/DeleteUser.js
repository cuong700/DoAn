import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, notification, Popconfirm } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";

function DeleteUser(props) {
  const { record, onReload } = props;

  const [loading, setLoading] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const token = getCookie("token");

      const res = await fetch(
        `http://localhost:8090/api/v1/users/admin/${record.id}/status`,
        {
          method: "PATCH",       
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isActive: false }),
        }
      );

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");

      notiApi.success({
        message: "Khoá tài khoản thành công",
        description: `Tài khoản: ${record.fullname || record.firstName} đã bị khoá.`,
      });

      onReload(); // reload lại bảng
    } catch (err) {
      console.error(err);
      message.error("Khoá tài khoản thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Popconfirm
        title="Khoá tài khoản này?"
        onConfirm={handleDelete}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        <Button
          size="small"
          type="text"
          style={{ color: "#ff4d4f" }}
          icon={<DeleteOutlined />}
          loading={loading}
        />
      </Popconfirm>
    </>
  );
}

export default DeleteUser;
