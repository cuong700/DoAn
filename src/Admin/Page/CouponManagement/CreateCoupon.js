import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Spin } from "antd";
import { useState } from "react";

function CreateCoupon(props) {
  const { onReload } = props;
  const [showModal, setShowModal] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);

      const payload = {
        ...value,
      };

      const res = await fetch("https://dummyjson.com/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Thêm mã giảm giá thất bại");

      notiApi.success({
        message: "Thêm mới thành công",
        description: "Thông tin mã giảm giá đã được thêm mới.",
      });

      setShowModal(false);
      onReload();
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi tải danh sách mã giảm giá",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setSpinning(false);
    }
  };

  const rules = [
    {
      required: true,
      message: "Bắt buộc!",
    },
  ];

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="btn-add1"
        onClick={handleShowModal}
      >
        Thêm mới
      </Button>

      <Modal
        title="Thêm mã giảm giá"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Spin spinning={spinning}>
          <Form
            layout="vertical"
            onFinish={handleSubmit}
            form={form}
            destroyOnClose //Đóng modal là xoá luôn form bên trong.
          >
            <Form.Item label="Mã giảm giá" name="code" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Tên giảm giá" name="body" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Trạng thái" name="attribute" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Dấu" name="operator" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Giá trị" name="value" rules={rules}>
              <Input />
            </Form.Item>
            <Form.Item label="Giảm giá" name="discount_amount" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Loại giảm" name="is_percent" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Áp dụng" name="apply_to_all" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm mới
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}

export default CreateCoupon;
