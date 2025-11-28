import { EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal} from "antd";
import { useState } from "react";
import dayjs from "dayjs";

function ViewProduct (props) {
  const { record } = props;

  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const handleShowModal = () => {
    setShowModal(true);

    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate
        ? dayjs(record.birthDate) // DatePicker cần dayjs object
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
        title="Xem thông tin sản phẩm"
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
            <Form.Item label="Ảnh sản phẩm" name="thumbnail">
              <Input />
            </Form.Item>

            <Form.Item label="Tên sản phẩm" name="title">
              <Input />
            </Form.Item>

            <Form.Item label="Giá tiền" name="price" >
              <Input />
            </Form.Item>

           <Form.Item label="Mô tả" name="description" >
            <Input.TextArea  rows={3} />
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

export default ViewProduct;
