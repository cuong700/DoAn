import { SendOutlined } from "@ant-design/icons";
import { Button, message, Modal, notification } from "antd";
import { getCookie } from "../../../helpers/cookie";
import { useState } from "react";

function SendOutInvoice(props) {
  const { selectedRowKeys, dataSource, onReload } = props;

  const [modal, contextHolder] = Modal.useModal();
  const [notiApi, notificationContextHolder] = notification.useNotification();

  const [loading, setLoading] = useState(false);

  const updateOrderStatus = async (order, newStatus) => {
    try {
      const token = getCookie("token");

      const payload = {
        status: newStatus,
      };

      const res = await fetch(
        `http://localhost:8090/api/v1/orders/admin/order/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", res.status, text);
        throw new Error("Không thể cập nhật trạng thái");
      }

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleTransfer = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đơn hàng!");
      return;
    }

    // Lọc ra các đơn hàng được chọn
    const selectedOrders = dataSource.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    const invalidOrders = selectedOrders.filter(
      (order) => !["PENDING", "PROCESSING"].includes(order.status)
    );

    if (invalidOrders.length > 0) {
      message.error(
        "Chỉ có thể chuyển giao đơn hàng ở trạng thái 'Chờ xử lý' hoặc 'Đã lên đơn'!"
      );
      return;
    }

    modal.confirm({
      title: "Xác nhận chuyển giao",
      content: `Bạn có chắc chắn muốn chuyển giao ${selectedRowKeys.length} đơn hàng?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);

          // Cập nhật từng đơn hàng
          const promises = selectedOrders.map((order) => {
            const newStatus =
              order.status === "PENDING" ? "PROCESSING" : "SHIPPED";
            return updateOrderStatus(order, newStatus);
          });

          await Promise.all(promises);

          notiApi.success({
            message: "Phê duyệt đơn thành công",
            description: `Đã phê duyệt ${selectedOrders.length} đơn hàng.`,
          });

          onReload();
        } catch (error) {
          message.error("Có lỗi xảy ra khi chuyển giao đơn hàng!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Kiểm tra xem có đơn nào có thể chuyển giao không
  const canTransfer = () => {
    if (selectedRowKeys.length === 0) return false;

    const selectedOrders = dataSource.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    return selectedOrders.every((order) =>
      ["PENDING", "PROCESSING"].includes(order.status)
    );
  };

  return (
    <>
      {notificationContextHolder}
      {contextHolder}
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleTransfer}
        disabled={!canTransfer()}
        loading={loading}
      >
        Chuyển giao
      </Button>
    </>
  );
}

export default SendOutInvoice;
