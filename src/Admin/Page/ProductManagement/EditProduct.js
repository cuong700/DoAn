import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Spin } from "antd";
import { useState } from "react";

function EditProduct(props) {
  const { record } = props;
  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const [spinning, setSpinning] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();

  const handleShowModal = () => {
    setShowModal(true);

     form.setFieldsValue({
      ...record,
    });
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

      const res = await fetch(`https://dummyjson.com/products/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update thất bại"); //Nếu API trả lỗi thì xuống catch

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin sản phẩm đã được cập nhật.",
      });
      setShowModal(false);
      // onReload(); // Khi cập nhật thành công thì mình sẽ reload lại để cập nhật ra giao diện
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi tải danh sách sản phẩm",
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
        size="small"
        type="text"
        style={{ color: "#1677ff" }}
        icon={<EditOutlined />}
        onClick={handleShowModal}
      />

      <Modal
        title="Chỉnh sửa thông tin"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Spin spinning={spinning} tip="Đang cập nhật...">
          <Form
          layout="vertical"
          onFinish={handleSubmit}
          form={form}
          destroyOnClose //Đóng modal là xoá luôn form bên trong.
        >
          <Form.Item label="Ảnh sản phẩm" name="thumbnail" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Tên sản phẩm" name="title" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Giá tiền" name="price" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="description" rules={rules}>
            <Input.TextArea  rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
        </Spin>
      </Modal>
    </>
  );
}

export default EditProduct;
