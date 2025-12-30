import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Spin } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";

function CreateCategory(props) {
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

      const token = getCookie("token");

      const payload = {
        ...value,
      };

      const res = await fetch("http://localhost:8090/api/v1/categories/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Thêm danh mục thất bại");

      notiApi.success({
        message: "Thêm mới thành công",
        description: "Thông tin danh mục đã được thêm mới.",
      });

      setShowModal(false);
      onReload();
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi tải danh sách danh mục",
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
        title="Thêm danh mục mới"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Spin spinning={spinning} tip="Đang thêm...">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item label="Tên danh mục" name="name" rules={rules}>
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

export default CreateCategory;
