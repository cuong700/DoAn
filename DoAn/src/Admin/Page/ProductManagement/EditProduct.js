import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Spin,
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

         const mapped = json.data.content.filter((item) => item.active === true) // lọc các phần tử thỏa mãn điều kiện và trả về một mảng mới.
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
            name: s.name  || "",
            total: s.total || 0,
          }))
        : [];

    form.setFieldsValue({
      name: record.name,
      category_id: record.category_id,
      description: record.description,
      cost: typeof record.cost === "number" ? record.cost : null,
      price: typeof record.price === "number" ? record.price : null,
      weight: typeof record.weight === "number" ? record.weight : null,
      total_stock:
        typeof record.total_stock === "number" ? record.total_stock : undefined,
      sizes: currentSizes,
    });
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

      const formData = new FormData();

      formData.append("name", value.name);
      formData.append(
        "price",
        parseInt(value.price.toString().replace(/\D/g, ""))
      ); //loại bỏ tất cả ký tự không phải chữ số
      formData.append(
        "cost",
        parseInt(value.cost.toString().replace(/\D/g, ""))
      );
      formData.append(
        "weight",
        parseInt(value.weight.toString().replace(/\D/g, ""))
      );
      formData.append("categoryId", value.category_id);
      formData.append("description", value.description || "");

      if (thumbnailFile.length > 0) {
        const thumbnail = thumbnailFile[0].originFileObj; //Nó chứa file gốc để mang đi upload.
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

      const token = getCookie("token");
      const res = await fetch(
        `http://localhost:8090/api/v1/products/admin/update/${record.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Update thất bại"); //Nếu API trả lỗi thì xuống catch

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin sản phẩm đã được cập nhật.",
      });

      setShowModal(false);
      form.resetFields();
      setThumbnailFile([]);
      setImagesFile([]);


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
            <Form.Item label="Ảnh sản phẩm" rules={rules}>
              {record.thumbnail && thumbnailFile.length === 0 && (
                <img
                  src={record.thumbnail}
                  alt="thumbnail"
                  crossOrigin="anonymous"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    marginBottom: 8,
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
              )}

              <Upload
                listType="picture-card"
                fileList={thumbnailFile} //file trong fileList không phải là File gốc mà là 1 object
                beforeUpload={() => false} // không upload ngay, để tự submit
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
                imagesFile.length === 0 && ( // chỉ show ảnh cũ khi chưa chọn ảnh mới
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    {record.images.map((url, index) => (
                      <img
                        key={index}
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
                    ))}
                  </div>
                )}

              <Upload
                listType="picture-card"
                multiple
                fileList={imagesFile}
                beforeUpload={() => false} //Upload sẽ tự gửi file lên server ngay khi chọn(chặn lại)
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

            <Form.Item label="Giá nhập" name="cost" rules={rules}>
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
                }
                parser={(value) => value.replace(/[^\d]/g, "")}
              />
            </Form.Item>

            <Form.Item label="Giá bán" name="price" rules={rules}>
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ"
                }
                parser={(value) => value.replace(/[^\d]/g, "")}
              />
            </Form.Item>

            <Form.Item label="Trọng lượng" name="weight">
              <InputNumber
                formatter={(v) => (v ? `${v} g` : "")}
                parser={(v) => v.replace(/[^\d]/g, "")}
              />
            </Form.Item>

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
                      <div>
                        {fields.map((field) => (
                          <div key={field.key} className="size-table__row">
                            <Form.Item
                              name={[field.name, "name"]} //Tạo ra tên field dạng mảng
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
