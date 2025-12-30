import { CheckOutlined } from "@ant-design/icons";
import { Button, message, Modal, notification } from "antd";
import { getCookie } from "../../../helpers/cookie";
import { useState } from "react";

function CheckOutInvoice(props) {
  const { selectedRowKeys, dataSource, onReload } = props;

  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const [notiApi, notificationContextHolder] = notification.useNotification();

  const updateOrderStatus = async (order, newStatus) => {
    try {
      const token = getCookie("token");

      const payload = {
        status: newStatus,
      };
      console.log("PAYLOAD SENT:", payload);
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

  const handleApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đơn hàng!");
      return;
    }

    // Lọc ra các đơn hàng được chọn
    const selectedOrders = dataSource.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    const invalidOrders = selectedOrders.filter(
      (order) => order.status !== "SHIPPED"
    );

    if (invalidOrders.length > 0) {
      message.error(
        "Chỉ có thể phê duyệt đơn hàng ở trạng thái 'Đang giao hàng'!"
      );
      return;
    }

    modal.confirm({
      title: "Xác nhận phê duyệt",
      content: `Bạn có chắc chắn muốn phê duyệt hoàn thành ${selectedRowKeys.length} đơn hàng?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const promises = selectedOrders.map((order) =>
            updateOrderStatus(order, "COMPLETED")
          );

          await Promise.all(promises);

          notiApi.success({
            message: "Cập nhật đơn hàng thành công",
            description: `${selectedOrders.length} đơn hàng đã được cập nhật.`,
          });

          onReload();
        } catch (error) {
          notiApi.error({
            message: "Cập nhật thất bại",
            description: "Có lỗi xảy ra khi cập nhật đơn hàng.",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  //Kiểm tra xem đơn hàng nào có thể phê duyệt
  const canApprove = () => {
    if (selectedRowKeys.length === 0) return false;

    const selectedOrders = dataSource.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    // Chỉ enable nếu TẤT CẢ đơn được chọn đều ở trạng thái SHIPPED
    return selectedOrders.every((order) => order.status === "SHIPPED");
  };

  return (
    <>
      {notificationContextHolder}
      {contextHolder}
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={handleApprove}
        disabled={!canApprove()}
        loading={loading}
        style={{
          backgroundColor: canApprove() ? "#52c41a" : "#ebebebff",
          borderColor: canApprove() ? "#52c41a" : "#E5E5E5",
          cursor: canApprove() ? "pointer" : "not-allowed",
        }}
      >
        Phê duyệt
      </Button>
    </>
  );
}

export default CheckOutInvoice;
