import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, notification, Spin, Switch } from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import API_BASE_URL from '../../../config/api';

function EditCategory(props) {
  const { record, onReload } = props;

  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const [notiApi, contextHolder] = notification.useNotification();

  const [spinning, setSpinning] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);

    form.setFieldsValue({
      name: record?.name || "",
      active: record?.active !== undefined ? record.active : true, // Set giá trị active
    });
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

      const res = await fetch(`${API_BASE_URL}/api/v1/categories/admin/update/${record.id}`, {
        method: "PATCH",
       headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, 
          },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update thất bại"); //Nếu API trả lỗi thì xuống catch

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin danh mục đã được cập nhật.",
      });
      setShowModal(false);
      onReload(); // Khi cập nhật thành công thì mình sẽ reload lại để cập nhật ra giao diện
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
            <Form.Item label="Tên danh mục" name="name" rules={rules}>
              <Input />
            </Form.Item>

             {!record.active && (
              <Form.Item
                label="Trạng thái"
                name="active"
                valuePropName="checked" // prop bắt buộc cho Switch 
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Ngừng hoạt động"
                />
              </Form.Item>
            )}

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

export default EditCategory;
