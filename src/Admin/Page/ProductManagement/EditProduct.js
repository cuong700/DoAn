import { EditOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
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
import { useState, useEffect } from "react";
// import "./ProductManagement.css"; // Removed to prevent compilation error
import { getCookie } from "../../../helpers/cookie";

function EditProduct(props) {
  const { record, onReload } = props;
  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho ảnh mới (Upload)
  const [thumbnailFile, setThumbnailFile] = useState([]);
  const [imagesFile, setImagesFile] = useState([]);

  // State quản lý danh sách ảnh CŨ
  const [existingImages, setExistingImages] = useState([]);

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

        if (!res.ok) {
          throw new Error(`Lỗi server: ${res.status}`);
        }

        const json = await res.json();
        const mapped = json.data.content
          .filter((item) => item.active === true)
          .map((item) => ({
            value: item.id,
            label: item.name,
          }));
        setCategories(mapped);

      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
        setCategories([]); 
        notiApi.error({
          message: "Không thể tải danh mục",
          description:
            error.message || "Vui lòng kiểm tra kết nối và thử lại sau.",
          duration: 5,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, []);


  const handleShowModal = () => {
    setExistingImages([]);
    setThumbnailFile([]);
    setImagesFile([]);

    // Load ảnh từ record hiện tại
    if (record?.images && Array.isArray(record.images)) {
      setExistingImages([...record.images]);
    }

    const currentSizes =
      Array.isArray(record?.sizes) && record.sizes.length > 0
        ? record.sizes.map((s) => ({
            name: s.name || "",
            total: s.total || 0,
          }))
        : [];

    form.setFieldsValue({
      name: record?.name,
      category_id: record?.category_id,
      description: record?.description,
      cost: typeof record?.cost === "number" ? record.cost : null,
      price: typeof record?.price === "number" ? record.price : null,
      display_price:
        typeof record?.display_price === "number" ? record.display_price : null,
      weight: typeof record?.weight === "number" ? record.weight : null,
      sizes: currentSizes,
      active: record?.active !== undefined ? record.active : true,
    });

    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setThumbnailFile([]);
    setImagesFile([]);
    setExistingImages([]);
  };

  const handleRemoveExistingImage = (imageToRemove) => {
    setExistingImages((prev) => prev.filter((img) => img !== imageToRemove));
  };

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);
      const formData = new FormData();

      const parseSafeInt = (val) => {
        if (val === undefined || val === null || val === "") return 0;
        return parseInt(val.toString().replace(/\D/g, ""));
      };

      formData.append("name", value.name);
      formData.append("price", parseSafeInt(value.price));
      formData.append("cost", parseSafeInt(value.cost));

      if (
        value.display_price !== undefined &&
        value.display_price !== null &&
        value.display_price !== ""
      ) {
        formData.append("originalPrice", value.display_price);
      } else {
        formData.append("originalPrice", -1);
      }

      formData.append("weight", parseSafeInt(value.weight));
      formData.append("categoryId", value.category_id);
      formData.append("description", value.description || "");
      formData.append(
        "active",
        value.active !== undefined ? value.active : true
      );

      
      if (thumbnailFile.length > 0) {
        const thumbnail = thumbnailFile[0].originFileObj;
        if (thumbnail) {
          formData.append("thumbnail", thumbnail);
        }
      }

      // Xử lý images mới (upload thêm)
      if (imagesFile.length > 0) {
        imagesFile.forEach((file) => {
          if (file.originFileObj) {
            formData.append("images", file.originFileObj);
          }
        });
      }

      // Xử lý ảnh cũ giữ lại
      existingImages.forEach((url) => {
        
        let filename = url.substring(url.lastIndexOf("/") + 1);

       
        if (filename.includes("?")) {
          filename = filename.split("?")[0];
        }


        try {
          filename = decodeURIComponent(filename);
        } catch (e) {
          console.warn("Không decode được filename:", e);
        }

       
        formData.append("keptImages", filename);
      });

  
      if (value.sizes && Array.isArray(value.sizes) && value.sizes.length > 0) {
        value.sizes.forEach((item, index) => {
          formData.append(`sizeQuantities[${index}].sizeName`, item.name);
          formData.append(`sizeQuantities[${index}].quantity`, item.total);
        });
      }

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
      setExistingImages([]);

      setTimeout(() => {
        onReload();
      }, 1000);
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

  const rules = [{ required: true, message: "Bắt buộc!" }];

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
        width={800}
        destroyOnClose
      >
        <Spin spinning={spinning} tip="Đang cập nhật...">
          <Form layout="vertical" onFinish={handleSubmit} form={form}>
            {/* Ảnh đại diện */}
            <Form.Item label="Ảnh đại diện (Thumbnail)">
              {record.thumbnail && thumbnailFile.length === 0 && (
                <img
                  src={record.thumbnail}
                  alt="thumbnail"
                  crossOrigin="anonymous"
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    marginBottom: 8,
                    borderRadius: 8,
                    border: "1px solid #d9d9d9",
                  }}
                />
              )}
              <Upload
                listType="picture-card"
                fileList={thumbnailFile}
                beforeUpload={() => false}
                onChange={({ fileList }) => setThumbnailFile(fileList)}
                maxCount={1}
                accept="image/*"
              >
                {thumbnailFile.length >= 1 ? null : <div>Thay ảnh</div>}
              </Upload>
            </Form.Item>

            {/* Ảnh mô tả */}
            <Form.Item label="Ảnh mô tả (Album)">
              {existingImages.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 12,
                    padding: "10px",
                    border: "1px dashed #d9d9d9",
                    borderRadius: 8,
                    background: "#fafafa",
                  }}
                >
                  {existingImages.map((url, index) => (
                    <div
                      key={`existing-${index}-${url}`}
                      style={{
                        position: "relative",
                        width: 90,
                        height: 90,
                      }}
                    >
                      <img
                        src={url}
                        alt={`old-${index}`}
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 4,
                          border: "1px solid #eee",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <Button
                        type="primary"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 24,
                          height: 24,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          padding: 0,
                          zIndex: 10,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                        onClick={() => handleRemoveExistingImage(url)}
                      />
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
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Thêm ảnh</div>
                </div>
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
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) => value.replace(/\./g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giá bán" name="price" rules={rules}>
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) => value.replace(/\./g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giá sale" name="display_price">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      value
                        ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                        : ""
                    }
                    parser={(value) => value.replace(/\./g, "")}
                    placeholder="Để trống nếu không sale"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trọng lượng (gram)" name="weight">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) => value.replace(/\./g, "")}
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
                          padding: "8px",
                          border: "1px solid #f0f0f0",
                          borderRadius: 4,
                        }}
                      >
                        {fields.map((field) => (
                          <div key={field.key} className="size-table__row">
                            <Form.Item
                              name={[field.name, "name"]}
                              rules={[{ required: true, message: "Nhập size" }]}
                              style={{ marginBottom: 0, flex: 1 }}
                            >
                              <Input placeholder="Size" />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, "total"]}
                              rules={[
                                { required: true, message: "Nhập số lượng" },
                              ]}
                              style={{ marginBottom: 0, flex: 1 }}
                            >
                              <InputNumber
                                min={0}
                                placeholder="SL"
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
                          style={{ marginTop: 8, width: "100%" }}
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

            <Form.Item style={{ marginTop: 20, textAlign: "right" }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={spinning}>
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
