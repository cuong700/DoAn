import { DeleteOutlined } from "@ant-design/icons";
import { Button, message, notification, Popconfirm } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import API_BASE_URL from '../../../config/api';

function DeleteCategory(props) {
  const { record, onReload, activeFilter } = props;
  const [loading, setLoading] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();

  const handleDelete = async (value) => {
    try {
      setLoading(true);

      const token = getCookie("token");

      const res = await fetch(
        `${API_BASE_URL}/api/v1/categories/admin/delete/${record.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Delete thất bại");

      if (activeFilter === "NGUNG_HOAT_DONG") {
        notiApi.info({
          message: "Thông báo",
          description: `Danh mục "${record.name}" đã được xoá trước đó `,
        });
      } else {
        notiApi.success({
          message: "Xoá thành công",
          description: `Đã xoá danh mục: ${record.name}`,
        });
      }

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

  const confirmTitle =
    activeFilter === "NGUNG_HOAT_DONG"
      ? "Danh mục này đã bị xoá."
      : "Bạn chắc chắn muốn xoá?";

  const showOkButton = activeFilter !== "NGUNG_HOAT_DONG";
  return (
    <>
      {contextHolder}
      <Popconfirm
        title={confirmTitle}
        onConfirm={showOkButton ? handleDelete : undefined}
        okText="Xoá"
        cancelText={showOkButton ? "Huỷ" : "Đóng"}
        showCancel={true}
        okButtonProps={{
          style: { display: showOkButton ? "inline-block" : "none" },
        }}
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

export default DeleteCategory;
