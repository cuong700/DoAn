import { EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Modal, Image, Row, Col } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

function ViewProduct(props) {
  const { record } = props;

  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const formatPrice = (value) => {
    return typeof value === "number"
      ? value.toLocaleString("vi-VN") + " đ"
      : "0 đ";
  };

  const formatWeight = (value) => {
    const weightGrams = value;
    if (weightGrams < 1000) {
      return `${weightGrams.toLocaleString("vi-VN")} g`;
    } else {
      const weightKg = weightGrams / 1000;
      return `${weightKg.toLocaleString("vi-VN")} kg`;
    }
  };

  const handleShowModal = () => {
    setShowModal(true);

    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate
        ? dayjs(record.birthDate) // DatePicker cần dayjs object
        : null,
      sizes:
        record.sizes?.map((s) => ({
          name: s.name,
          total: s.total,
        })) || [],
      cost: formatPrice(record.cost),
      price: formatPrice(record.price),
      display_price: formatPrice(record.display_price),
      weight: formatWeight(record.weight),
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
        <Form layout="vertical" form={form} destroyOnClose disabled>
          <Form.Item label="Ảnh sản phẩm">
            {record.thumbnail ? (
              <Image
                crossOrigin="anonymous"
                src={record.thumbnail}
                alt="thumbnail"
                width={80}
                height={80}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #eee",
                }}
              />
            ) : (
              <span>Không có ảnh</span>
            )}
          </Form.Item>

          <Form.Item label="Ảnh mô tả">
            {Array.isArray(record.images) && record.images.length > 0 ? (
              <Image.PreviewGroup>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {record.images.map((url, index) => (
                    <Image
                      key={index}
                      crossOrigin="anonymous"
                      src={url}
                      alt={`image-${index}`}
                      width={80}
                      height={80}
                      style={{
                        objectFit: "cover",
                        borderRadius: 4,
                        border: "1px solid #eee",
                      }}
                    />
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <span>Không có ảnh mô tả</span>
            )}
          </Form.Item>

          <Form.Item label="Tên sản phẩm" name="name">
            <Input />
          </Form.Item>

          <Form.Item label="Danh mục" name="category_name">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giá nhập" name="cost">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Giá bán" name="price">
                <Input />
              </Form.Item>
            </Col>
          </Row>


          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Giá sale" name="display_price">
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Trọng lượng" name="weight">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Bảng size">
            <div className="size-table">
              <div className="size-table__header">
                <span>Size</span>
                <span>Số lượng</span>
                <span></span>
              </div>

              <Form.List name="sizes">
                {(fields) => (
                  <>
                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      {fields.map((field) => (
                        <div key={field.key} className="size-table__row">
                          <Form.Item
                            {...field}
                            name={[field.name, "name"]}
                            rules={[{ required: true, message: "Nhập size" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="VD: 41" />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "total"]}
                            rules={[
                              { required: true, message: "Nhập số lượng" },
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              placeholder="Số lượng"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Form.List>
            </div>
          </Form.Item>

          <Form.Item label="Số lượng tồn kho(đôi)" name="total_stock">
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Ngày tạo" name="created_at">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày cập nhật" name="updated_at">
                <Input />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>
    </>
  );
}

export default ViewProduct;
