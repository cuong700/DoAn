import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Row,
  Select,
  Spin,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import "./ProductManagement.css";
import { getCookie } from "../../../helpers/cookie";

function CreateProduct(props) {
  const { onReload } = props;
  const [showModal, setShowModal] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [thumbnailFile, setThumbnailFile] = useState([]);
  const [imagesFile, setImagesFile] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        const token = getCookie("token");
        const res = await fetch(
          "http://localhost:8090/api/v1/categories/public/search",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error("Không lấy được danh mục");

        const json = await res.json();

        const mapped = json.data.content
          .filter((item) => item.active === true)
          .map((item) => ({
            value: item.id,
            label: item.name,
          }));

        setCategories(mapped);
      } catch (error) {
        console.error(error);
        notiApi.error({
          message: "Lỗi tải danh mục sản phẩm",
          description: "Vui lòng thử lại sau.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, []);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setThumbnailFile([]);
    setImagesFile([]);
  };

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);

      const token = getCookie("token");

      const formData = new FormData();

      formData.append("name", value.name);
      formData.append("price", value.price);
      formData.append("cost", value.cost);
      if (value.display_price !== undefined && value.display_price !== null && value.display_price !== "") {
          formData.append("originalPrice", value.display_price);
      }
      formData.append("weight", value.weight);
      formData.append("categoryId", value.category_id);
      formData.append("description", value.description || "");

      if (thumbnailFile.length > 0) {
        const thumbnail = thumbnailFile[0].originFileObj;
        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }
      }

      if (imagesFile.length > 0) {
        imagesFile.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }

      if (value.sizes && Array.isArray(value.sizes) && value.sizes.length > 0) {
        value.sizes.forEach((item, index) => {
          formData.append(`sizeQuantities[${index}].sizeName`, item.name);
          formData.append(`sizeQuantities[${index}].quantity`, item.total);
        });
      }

      const res = await fetch(
        "http://localhost:8090/api/v1/products/admin/create",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Thêm sản phẩm thất bại");

      notiApi.success({
        message: "Thêm mới thành công",
        description: "Thông tin sản phẩm đã được thêm mới.",
      });
      setShowModal(false);
      form.resetFields();
      setThumbnailFile([]);
      setImagesFile([]);

      setTimeout(() => {
        onReload();
      }, 500);
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi thêm sản phẩm",
        description: "Vui lòng kiểm tra lại thông tin.",
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
        title="Thêm sản phẩm mới"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Spin spinning={spinning} tip="Đang thêm...">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            <Form.Item label="Ảnh sản phẩm" name="thumbnail" rules={rules}>
              <Upload
                listType="picture-card"
                fileList={thumbnailFile}
                beforeUpload={() => false}
                onChange={({ fileList }) => setThumbnailFile(fileList)}
                maxCount={1}
                accept="image/*"
              >
                {thumbnailFile.length >= 1 ? null : <div>Chọn ảnh</div>}
              </Upload>
            </Form.Item>

            <Form.Item label="Ảnh mô tả" name="images" rules={rules}>
              <Upload
                listType="picture-card"
                multiple
                fileList={imagesFile}
                beforeUpload={() => false}
                onChange={({ fileList }) => setImagesFile(fileList)}
                accept="image/*"
              >
                <div>Chọn ảnh</div>
              </Upload>
            </Form.Item>

            <Form.Item label="Tên sản phẩm" name="name" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Danh mục" name="category_id" rules={rules}>
              <Select
                placeholder="Chọn danh mục"
                loading={loading}
                options={categories}
              />
            </Form.Item>

            <Form.Item label="Mô tả" name="description" rules={rules}>
              <Input.TextArea rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giá nhập" name="cost" rules={rules}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Giá bán" name="price" rules={rules}>
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Giá sale (nếu có)"
                  name="display_price"
                  // rules={rules}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Trọng lượng" name="weight">
                  <InputNumber min={0} style={{ width: "100%" }} />
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
                  {(fields, { add, remove }) => (
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
                              name={[field.name, "name"]}
                              rules={[{ required: true, message: "Nhập size" }]}
                              style={{ marginBottom: 0 }}
                            >
                              <Input placeholder="VD: 41" />
                            </Form.Item>

                            <Form.Item
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

                            <Button
                              type="link"
                              danger
                              onClick={() => remove(field.name)}
                            >
                              Xóa
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="dashed"
                          onClick={() => add()}
                          icon={<PlusOutlined />}
                          style={{ marginTop: 8 }}
                        >
                          Thêm size
                        </Button>
                      </div>
                    </>
                  )}
                </Form.List>
              </div>
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