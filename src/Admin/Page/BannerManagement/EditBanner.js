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
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";

function EditBanner({ record, onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();
  const [form] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Upload ảnh
  const [thumbnailFile, setThumbnailFile] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");

  const fetchProducts = async (keyword = "") => {
    try {
      setLoadingProducts(true);
      const token = getCookie("token");
      const params = new URLSearchParams({
        keyword: keyword || "",
        page: "0",
        limit: "100",
        active: "true",
      });
      const res = await fetch(
        `http://localhost:8090/api/v1/products/public/search?${params.toString()}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) { setProducts([]); return; }
      const json = await res.json();
      setProducts((json?.data || []).map((p) => ({ label: p.name, value: p.id })));
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleShowModal = async () => {
    await fetchProducts();
    // Hiển thị ảnh hiện tại trong Upload
    if (record.image_url) {
      setThumbnailFile([
        {
          uid: "-1",
          name: "banner-image",
          status: "done",
          url: record.image_url,
        },
      ]);
    }
    setUploadedImageUrl(record.image_url || "");
    form.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      badge: record.badge,
      product_id: record.product_id || undefined,
      display_order: record.display_order,
      active: record.active,
    });
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setThumbnailFile([]);
    setUploadedImageUrl("");
  };

  // Upload ảnh mới lên BE
  const handleUploadImage = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingImage(true);
      const token = getCookie("token");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "http://localhost:8090/api/v1/banners/admin/upload-image",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload ảnh thất bại");

      const json = await res.json();
      const imageUrl = json?.data?.image_url || "";
      setUploadedImageUrl(imageUrl);
      onSuccess(json, file);
    } catch (err) {
      console.error(err);
      onError(err);
      notiApi.error({ message: "Upload ảnh thất bại", description: "Vui lòng thử lại." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!uploadedImageUrl) {
      notiApi.warning({ message: "Vui lòng upload ảnh banner" });
      return;
    }

    try {
      setSpinning(true);
      const token = getCookie("token");

      const payload = {
        title: values.title,
        subtitle: values.subtitle || "",
        badge: values.badge || "",
        image_url: uploadedImageUrl,
        product_id: values.product_id || null,
        display_order: values.display_order ?? 0,
        active: values.active,
      };

      const res = await fetch(
        `http://localhost:8090/api/v1/banners/admin/update/${record.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Cập nhật banner thất bại");

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin banner đã được cập nhật.",
      });
      setShowModal(false);
      form.resetFields();
      setThumbnailFile([]);
      setUploadedImageUrl("");
      onReload();
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi cập nhật banner",
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
        title="Chỉnh sửa banner"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Spin spinning={spinning}>
          <Form layout="vertical" form={form} onFinish={handleSubmit}>

            {/* Upload ảnh */}
            <Form.Item
              label="Ảnh banner"
              required
              help={uploadedImageUrl ? "✓ Ảnh đã sẵn sàng" : ""}
              validateStatus={uploadedImageUrl ? "success" : ""}
            >
              <Upload
                listType="picture-card"
                fileList={thumbnailFile}
                customRequest={handleUploadImage}
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setThumbnailFile(fileList)}
                onRemove={() => {
                  setThumbnailFile([]);
                  setUploadedImageUrl("");
                }}
              >
                {thumbnailFile.length < 1 && (
                  <div>
                    {uploadingImage ? <Spin size="small" /> : <PlusOutlined />}
                    <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label="Tiêu đề" name="title" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Phụ đề" name="subtitle">
              <Input />
            </Form.Item>

            <Form.Item label="Badge" name="badge">
              <Input />
            </Form.Item>

            <Form.Item label="Sản phẩm liên kết" name="product_id">
              <Select
                placeholder="Chọn sản phẩm (tuỳ chọn)"
                options={products}
                loading={loadingProducts}
                showSearch
                allowClear
                optionFilterProp="label"
                onSearch={fetchProducts}
              />
            </Form.Item>

            <Form.Item label="Thứ tự hiển thị" name="display_order">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Trạng thái" name="active" rules={rules}>
              <Select>
                <Select.Option value={true}>Hiển thị</Select.Option>
                <Select.Option value={false}>Ẩn</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
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

export default EditBanner;
