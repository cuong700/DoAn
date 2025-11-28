import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Spin } from "antd";
import { useState } from "react";

function CreateProduct(props) {
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

      const res = await fetch(" https://dummyjson.com/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Thêm sản phẩm thất bại");

      notiApi.success({
        message: "Thêm mới thành công",
        description: "Thông tin sản phẩm đã được thêm mới.",
      });

      setShowModal(false);
      onReload();
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
        type="primary"
        icon={<PlusOutlined />}
        className="btn-add1"
        onClick={handleShowModal}
      >
        Thêm mới
      </Button>

      <Modal
        title="Thêm người dùng mới"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Spin spinning={spinning} tip="Đang thêm...">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>

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
              <Input.TextArea rows={3} />
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

export default CreateProduct;
