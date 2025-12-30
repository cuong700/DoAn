import { CloseOutlined } from "@ant-design/icons";
import { Button, Form, message, Modal } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import TextArea from "antd/es/input/TextArea";

function CloseOutInvoice(props) {
  const { selectedRowKeys, dataSource, onReload } = props;

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const updateOrderStatus = async (order, newStatus, cancellation_reason) => {
    try {
      const token = getCookie("token");

      const payload = {
        status: newStatus,
        reason: cancellation_reason,
      };

      console.log("PAYLOAD SEND:", payload);

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

  const handleShowModal = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Vui lòng chọn ít nhất một đơn hàng!");
      return;
    }

    const selectedOrders = dataSource.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    const invalidOrders = selectedOrders.filter(
      (order) => !["PENDING", "PROCESSING", "SHIPPED"].includes(order.status) //kiểm tra phần tử có tồn tại
    );

    if (invalidOrders.length > 0) {
      message.error(
        "Chỉ có thể từ chối đơn hàng ở trạng thái 'Chờ xử lý' hoặc 'Đã lên đơn'!"
      );
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const selectedOrders = dataSource.filter((item) =>
        selectedRowKeys.includes(item.id)
      );

      const promises = selectedOrders.map((order) =>
        updateOrderStatus(order, "CANCELLED", values.cancellation_reason)
      );

      await Promise.all(promises);
      message.success("Từ chối đơn hàng thành công!");
      setShowModal(false);
      form.resetFields();

      onReload();
    } catch (error) {
      if (error.errorFields) {
        message.warning("Vui lòng điền đầy đủ thông tin!");
      } else {
        message.error("Có lỗi xảy ra khi từ chối đơn hàng!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };

  const canReject = () => {
    if (selectedRowKeys.length === 0) return false;

    const selectedOrders = dataSource.filter((item) =>
      selectedRowKeys.includes(item.id)
    );

    return selectedOrders.every((order) =>
      ["PENDING", "PROCESSING", "SHIPPED"].includes(order.status)
    );
  };

  return (
    <>
      <Button
        danger
        icon={<CloseOutlined />}
        onClick={handleShowModal}
        disabled={!canReject()}
        loading={loading}
      >
        Từ chối
      </Button>

      <Modal
        title="Từ chối đơn hàng"
        open={showModal}
        onOk={() => form.submit()}
        onCancel={handleCancel}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading }}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Form.Item
            label={
              <span>
                <span style={{ color: "red" }}> </span>
                Mô tả lý do từ chối
              </span>
            }
            name="cancellation_reason"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả chi tiết!",
              },
              {
                max: 500,
                message: "Mô tả không được vượt quá 500 ký tự!",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết lý do từ chối"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff2e8",
              border: "1px solid #ffbb96",
              borderRadius: "4px",
            }}
          >
            <div style={{ color: "#d4380d", fontWeight: 500 }}>Cảnh báo:</div>
            <div style={{ color: "#8c8c8c", marginTop: 4 }}>
              Hành động này sẽ từ chối các đơn hàng đã chọn và không thể hoàn
              tác. Vui lòng kiểm tra kỹ trước khi xác nhận.
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
}

export default CloseOutInvoice;
