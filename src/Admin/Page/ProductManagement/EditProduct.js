import { EditOutlined, PlusOutlined } from "@ant-design/icons";
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
  Switch,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import "./ProductManagement.css";
import { getCookie } from "../../../helpers/cookie";

function EditProduct(props) {
  const { record, onReload } = props;
  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const [spinning, setSpinning] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState([]);
  const [imagesFile, setImagesFile] = useState([]);
  const [deletedThumbnail, setDeletedThumbnail] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);

        const token = getCookie("token");
        const res = await fetch(
          "http://localhost:8090/api/v1/categories/public/search?active=true",
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

    const currentSizes =
      Array.isArray(record.sizes) && record.sizes.length > 0
        ? record.sizes.map((s) => ({
            name: s.name || "",
            total: s.total || 0,
          }))
        : [];

    form.setFieldsValue({
      name: record.name,
      category_id: record.category_id,
      description: record.description,
      cost: typeof record.cost === "number" ? record.cost : null,
      price: typeof record.price === "number" ? record.price : null,
      display_price:
        typeof record.display_price === "number" ? record.display_price : null,
      weight: typeof record.weight === "number" ? record.weight : null,
      total_stock:
        typeof record.total_stock === "number" ? record.total_stock : undefined,
      sizes: currentSizes,
      active: record?.active !== undefined ? record.active : true,
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setThumbnailFile([]);
    setImagesFile([]);
    setDeletedThumbnail(false);
    setDeletedImages([]);
  };

  const handleDeleteThumbnail = () => {
    setDeletedThumbnail(true);
  };

  const handleDeleteImage = (imageUrl) => {
    setDeletedImages([...deletedImages, imageUrl]);
  };

  // Helper function: Extract filename từ URL
  const extractFilename = (url) => {
    if (!url) return "";
    const parts = url.split("/");
    return parts[parts.length - 1];
  };

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);

      const formData = new FormData();

      // Thông tin cơ bản
      formData.append("name", value.name);
      formData.append(
        "price",
        parseInt(value.price.toString().replace(/\D/g, ""))
      );
      formData.append(
        "cost",
        parseInt(value.cost.toString().replace(/\D/g, ""))
      );
      formData.append(
        "originalPrice",
        parseInt(value.display_price.toString().replace(/\D/g, ""))
      );
      formData.append(
        "weight",
        parseInt(value.weight.toString().replace(/\D/g, ""))
      );
      formData.append("categoryId", value.category_id);
      formData.append("description", value.description || "");
      formData.append("active", value.active !== undefined ? value.active : true);

      // ===== XỬ LÝ THUMBNAIL =====
      if (deletedThumbnail) {
        formData.append("deleteThumbnail", "true");
      }

      if (thumbnailFile.length > 0) {
        const thumbnail = thumbnailFile[0].originFileObj;
        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }
      }

      // ===== DEBUG: Kiểm tra dữ liệu trước khi gửi =====
      console.log("🔍 DEBUG - record.images:", record.images);
      console.log("🔍 DEBUG - deletedImages:", deletedImages);
      console.log("🔍 DEBUG - imagesFile.length:", imagesFile.length);

      // ===== XỬ LÝ DANH SÁCH ẢNH MÔ TẢ =====
      // Nếu user CHƯA upload ảnh mới, gửi danh sách ảnh CÒN LẠI
      if (imagesFile.length === 0 && Array.isArray(record.images) && record.images.length > 0) {
        const keptImages = record.images
          .filter((url) => {
            const isDeleted = deletedImages.includes(url);
            console.log(`   🔍 URL: ${url}`);
            console.log(`   🔍 Extracted: ${extractFilename(url)}`);
            console.log(`   🔍 isDeleted: ${isDeleted}`);
            return !isDeleted;
          })
          .map((url) => {
            const filename = extractFilename(url);
            // Thử nhiều cách extract khác nhau
            const alternatives = [
              filename,                                           // abc.jpg
              filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''), // abc (no extension)
            ];

            console.log(`   🔧 Alternatives for ${url}:`, alternatives);
            return alternatives[0]; // Gửi cả extension
          });

        console.log("📤 Gửi keptImages lên backend:", keptImages);

        keptImages.forEach((filename, index) => {
          formData.append(`keptImages[${index}]`, filename);
        });
      }

      // Nếu user upload ảnh mới, gửi ảnh mới
      if (imagesFile.length > 0) {
        imagesFile.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }

      // ===== XỬ LÝ SIZE =====
      if (value.sizes && Array.isArray(value.sizes) && value.sizes.length > 0) {
        value.sizes.forEach((item, index) => {
          formData.append(`sizeQuantities[${index}].sizeName`, item.name);
          formData.append(`sizeQuantities[${index}].quantity`, item.total);
        });
      }

      // ===== GỬI REQUEST =====
      const token = getCookie("token");
      const res = await fetch(
        `http://localhost:8090/api/v1/products/admin/update/${record.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Update thất bại");

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin sản phẩm đã được cập nhật.",
      });

      setShowModal(false);
      form.resetFields();
      setThumbnailFile([]);
      setImagesFile([]);
      setDeletedThumbnail(false);
      setDeletedImages([]);

      setTimeout(() => {
        onReload();
      }, 1000);
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi cập nhật sản phẩm",
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
            destroyOnClose
          >
            <Form.Item label="Ảnh sản phẩm" rules={rules}>
              {record.thumbnail && thumbnailFile.length === 0 && !deletedThumbnail && (
                <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                  <img
                    src={record.thumbnail}
                    alt="thumbnail"
                    crossOrigin="anonymous"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid #eee",
                    }}
                  />
                  <Button
                    danger
                    size="small"
                    type="primary"
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      padding: "0 8px",
                      minWidth: "auto",
                      height: 24,
                    }}
                    onClick={handleDeleteThumbnail}
                  >
                    ×
                  </Button>
                </div>
              )}

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

            <Form.Item label="Ảnh mô tả" rules={rules}>
              {Array.isArray(record.images) &&
                record.images.length > 0 &&
                imagesFile.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {record.images
                      .filter((url) => !deletedImages.includes(url))
                      .map((url, index) => (
                        <div
                          key={index}
                          style={{ position: "relative", display: "inline-block" }}
                        >
                          <img
                            src={url}
                            crossOrigin="anonymous"
                            alt={`image-${index}`}
                            style={{
                              width: 60,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid #eee",
                            }}
                          />
                          <Button
                            danger
                            size="small"
                            type="primary"
                            style={{
                              position: "absolute",
                              top: -8,
                              right: -8,
                              padding: "0 8px",
                              minWidth: "auto",
                              height: 24,
                            }}
                            onClick={() => handleDeleteImage(url)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                  </div>
                )}

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
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    controls={false}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
                    }
                    parser={(value) => value.replace(/[^\d]/g, "")}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Giá bán" name="price" rules={rules}>
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    controls={false}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
                    }
                    parser={(value) => value.replace(/[^\d]/g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giá sale" name="display_price" rules={rules}>
                  <InputNumber
                    min={0}
                    controls={false}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
                    }
                    parser={(value) => value.replace(/[^\d]/g, "")}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="Trọng lượng" name="weight" >
                  <InputNumber
                  min={0}
                   style={{ width: "100%" }}
                   controls={false}
                    formatter={(v) => (v ? `${v} g` : "")}
                    parser={(v) => v.replace(/[^\d]/g, "")}
                  />
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

             {!record.active && (
              <Form.Item
                label="Trạng thái"
                name="active"
                valuePropName="checked"
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

export default EditProduct;