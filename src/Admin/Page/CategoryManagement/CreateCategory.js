import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Spin } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import API_BASE_URL from '../../../config/api';

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

    const res = await fetch(`${API_BASE_URL}/api/v1/categories/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });


    const json = await res.json();

    if (!res.ok || json.status !== "CREATED") {
      throw new Error(json.message || "Thêm danh mục thất bại");
    }

    notiApi.success({
      message: "Thêm mới thành công",
      description: `Đã thêm danh mục: ${json.data.name}`,
    });

    setShowModal(false);
    form.resetFields(); // Reset form sau khi thêm thành công
    onReload();
  } catch (error) {
    console.error("Error:", error);
    notiApi.error({
      message: "Lỗi thêm danh mục",
      description: error.message || "Vui lòng thử lại sau.",
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
