import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  notification,
  Spin,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";

function EditUser(props) {
  const { record, onReload } = props;

  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const [notiApi, contextHolder] = notification.useNotification();

  const [spinning, setSpinning] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);

    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate
        ? dayjs(record.birthDate) // DatePicker cần dayjs object
        : null,
        password: "********",
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
        birthDate: value.birthDate
          ? value.birthDate.format("DD/MM/YYYY")
          : "—",
      };

      const res = await fetch(`https://dummyjson.com/users/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update thất bại"); //Nếu API trả lỗi thì xuống catch

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin người dùng đã được cập nhật.",
      });
      setShowModal(false);
      onReload(); // Khi cập nhật thành công thì mình sẽ reload lại để cập nhật ra giao diện
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi tải danh sách người dùng",
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
            <Form.Item label="Họ và tên" name="firstName" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="birthDate" rules={rules}>
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password" rules={rules}>
              <Input.Password disabled/>
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address" rules={rules}>
              <Input.TextArea />
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

export default EditUser;
