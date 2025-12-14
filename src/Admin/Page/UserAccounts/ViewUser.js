import { EyeOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Modal} from "antd";
import { useState } from "react";
import dayjs from "dayjs";

function ViewUser(props) {
  const { record } = props;

  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const handleShowModal = () => {
    setShowModal(true);

    form.setFieldsValue({
      ...record,
      date_of_birth: record.date_of_birth
        ? dayjs(record.date_of_birth) 
        : null,
    });
  };

  
  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };


  return (
    <>
      <Button
        size="small"
        type="text"
        style={{ color: "black" }}
        icon={<EyeOutlined />}
        onClick={handleShowModal}
      />

       <Modal
        title="Xem thông tin người dùng"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        
          <Form
            layout="vertical"
            form={form}
            destroyOnClose
            disabled
          >
            <Form.Item label="Họ và tên" name="fullname" >
              <Input />
            </Form.Item>

            <Form.Item label="Ngày sinh" name="date_of_birth" >
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone_number" >
              <Input />
            </Form.Item>

            <Form.Item label="Địa chỉ" name="address" >
              <Input.TextArea />
            </Form.Item>

             <Form.Item label="Ngày tạo" name="created_at">
              <Input />
            </Form.Item>

             <Form.Item label="Ngày cập nhật" name="updated_at">
              <Input />
            </Form.Item>

          </Form>
       
      </Modal>
    </>
  );
}

export default ViewUser;
