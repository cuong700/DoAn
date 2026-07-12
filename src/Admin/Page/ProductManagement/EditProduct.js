import API_BASE_URL from '../../../config/api';

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
  ColorPicker,
  Table,
  Tag,
  Popconfirm,
  Tabs,
  DatePicker,
} from "antd";
import { useState, useEffect } from "react";
import { getCookie } from "../../../helpers/cookie";
import dayjs from "dayjs";

function EditProduct({ record, onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // Ảnh — mỗi item: { url: string, colorId: number|null }
  const [thumbnailFile, setThumbnailFile] = useState([]);
  // Ảnh mới upload: [{ uid, file: File, previewUrl: string, colorId: null }]
  const [imagesFile, setImagesFile]       = useState([]);
  const [existingImages, setExistingImages] = useState([]); // { url, colorId }

  // Size / Color / Variant
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [variants, setVariants] = useState([]);

  const [deletedSizeIds, setDeletedSizeIds] = useState([]);
  const [deletedColorIds, setDeletedColorIds] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);

  // Form thêm màu mới
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");
  // Ảnh gán cho từng màu: { [colorKey]: File } — colorKey = id hoặc color_name nếu mới
  const [colorImages, setColorImages] = useState({});

  // ── Fetch danh mục ──────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setCatLoading(true);
        const token = getCookie("token");
        const res = await fetch(
          `${API_BASE_URL}/api/v1/categories/public/search?active=true`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setCategories(
          json.data.content
            .filter((c) => c.active)
            .map((c) => ({ value: c.id, label: c.name })),
        );
      } catch (e) {
        notiApi.error({
          message: "Không thể tải danh mục",
          description: e.message,
        });
      } finally {
        setCatLoading(false);
      }
    };
    load();
  }, []);

  // ── Mở modal — fetch detail để lấy sizes/colors/variants đầy đủ ──
  const handleShowModal = async () => {
    // Reset
    setThumbnailFile([]);
    setImagesFile([]);
    setDeletedSizeIds([]);
    setDeletedColorIds([]);
    setDeletedVariantIds([]);
    setNewColorName("");
    setNewColorCode("#000000");
    setColorImages({});

    // Fetch detail để lấy sizes/colors/variants/images đầy đủ
    let detail = record;
    try {
      const token = getCookie("token");
      const res = await fetch(
        `http://localhost:8090/api/v1/products/public/${record.id}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const json = await res.json();
        detail = json?.data ?? json;
      }
    } catch (e) {
      console.error("Không thể fetch detail sản phẩm:", e);
    }

    const buildImageUrl = (path) => {
      if (!path) return "";
      if (path.startsWith("http")) return path;
      return `http://localhost:8090${path}`;
    };

    // Ảnh — giữ cả url lẫn colorId để gán màu
    setExistingImages(
      Array.isArray(detail.images)
        ? detail.images.map((img) => {
            if (typeof img === "string") return { url: buildImageUrl(img), colorId: null };
            const url = buildImageUrl(img?.image_url ?? img?.url ?? "");
            return { url, colorId: img?.color_id ?? null };
          })
        : [],
    );

    // Sizes — detail.sizes đã có { id, name } hoặc { id, size_name }
    setSizes(
      (detail.sizes ?? []).map((s) => ({
        id: s.id ?? null,
        name: s.name ?? s.size_name ?? "",
      })),
    );

    // Colors — detail.colors đã có { id, color_name, color_code }
    setColors(
      (detail.colors ?? []).map((c) => ({
        id: c.id ?? null,
        color_name: c.color_name ?? "",
        color_code: c.color_code ?? "#000000",
      })),
    );

    // Variants — detail.variants đã có đầy đủ
    setVariants(
      (detail.variants ?? []).map((v) => ({
        id: v.id ?? null,
        size_id: v.size_id ?? null,
        size_name: v.size_name ?? "",
        color_id: v.color_id ?? null,
        color_name: v.color_name ?? "",
        color_code: v.color_code ?? "",
        stock: v.stock ?? 0,
      })),
    );

    form.setFieldsValue({
      name: detail.name ?? record.name,
      category_id: detail.category_id ?? record.category_id,
      description: detail.description ?? record.description,
      cost: typeof detail.cost === "number" ? detail.cost : (typeof record.cost === "number" ? record.cost : null),
      price: typeof detail.price === "number" ? detail.price : (typeof record.price === "number" ? record.price : null),
      display_price: typeof detail.display_price === "number" ? detail.display_price : (typeof record.display_price === "number" ? record.display_price : null),
      weight: typeof detail.weight === "number" ? detail.weight : (typeof record.weight === "number" ? record.weight : null),
      active: detail.active ?? record.active ?? true,
      sale_range: (() => {
        const start = detail.sale_start ?? record.sale_start;
        const end   = detail.sale_end   ?? record.sale_end;
        if (start || end) return [start ? dayjs(start) : null, end ? dayjs(end) : null];
        return null;
      })(),
    });

    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
    setThumbnailFile([]);
    imagesFile.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
    setImagesFile([]);
    setExistingImages([]);
    setSizes([]);
    setColors([]);
    setVariants([]);
    setDeletedSizeIds([]);
    setDeletedColorIds([]);
    setDeletedVariantIds([]);
    setColorImages({});
  };

  // ── Ảnh ────────────────────────────────────────────────────────────────────
  const removeExistingImage = (url) =>
    setExistingImages((prev) => prev.filter((img) => img.url !== url));

  const setExistingImageColor = (url, colorId) =>
    setExistingImages((prev) =>
      prev.map((img) => img.url === url ? { ...img, colorId } : img)
    );

  // ── Size ───────────────────────────────────────────────────────────────────
  const addSize = () =>
    setSizes((prev) => [...prev, { id: null, name: "", isNew: true }]);

  const changeSizeName = (index, value) =>
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, name: value } : s)),
    );

  const deleteSize = (index) => {
    const s = sizes[index];
    if (s.id) {
      setDeletedSizeIds((p) => [...p, s.id]);
      const rel = variants.filter((v) => v.size_id === s.id && v.id);
      setDeletedVariantIds((p) => [...p, ...rel.map((v) => v.id)]);
      setVariants((p) => p.filter((v) => v.size_id !== s.id));
    }
    setSizes((p) => p.filter((_, i) => i !== index));
  };

  // ── Color ──────────────────────────────────────────────────────────────────
  const addColor = () => {
    if (!newColorName.trim()) {
      notiApi.warning({ message: "Vui lòng nhập tên màu" });
      return;
    }
    setColors((prev) => [
      ...prev,
      {
        id: null,
        color_name: newColorName.trim(),
        color_code: newColorCode,
        isNew: true,
      },
    ]);
    setNewColorName("");
    setNewColorCode("#000000");
  };

  const deleteColor = (index) => {
    const c = colors[index];
    if (c.id) {
      setDeletedColorIds((p) => [...p, c.id]);
      const rel = variants.filter((v) => v.color_id === c.id && v.id);
      setDeletedVariantIds((p) => [...p, ...rel.map((v) => v.id)]);
      setVariants((p) => p.filter((v) => v.color_id !== c.id));
    }
    setColors((p) => p.filter((_, i) => i !== index));
  };

  // ── Variant ────────────────────────────────────────────────────────────────
  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      {
        id: null,
        size_id: null,
        size_name: "",
        color_id: null,
        color_name: "",
        color_code: "",
        stock: 0,
        isNew: true,
      },
    ]);

  const changeVariant = (index, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      if (field === "size_id") {
        const found = sizes.find((s) => s.id === value || s.name === value);
        next[index] = {
          ...next[index],
          size_id: found?.id ?? null,
          size_name: found?.name ?? "",
        };
      } else if (field === "color_id") {
        const found = colors.find((c) =>
          c.id != null ? c.id === value : c.color_name === value,
        );
        next[index] = {
          ...next[index],
          color_id: found?.id ?? null,
          color_name: found?.color_name ?? "",
          color_code: found?.color_code ?? "",
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const deleteVariant = (index) => {
    const v = variants[index];
    if (v.id) setDeletedVariantIds((p) => [...p, v.id]);
    setVariants((p) => p.filter((_, i) => i !== index));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (value) => {
    try {
      setSpinning(true);
      const fd = new FormData();

      const toInt = (v) =>
        v == null || v === "" ? 0 : parseInt(String(v).replace(/\D/g, ""), 10);

      fd.append("name", value.name);
      fd.append("price", toInt(value.price));
      fd.append("cost", toInt(value.cost));
      fd.append(
        "originalPrice",
        value.display_price != null && value.display_price !== ""
          ? value.display_price
          : -1,
      );
      fd.append("weight", toInt(value.weight));
      fd.append("categoryId", value.category_id);
      fd.append("description", value.description || "");
      fd.append("active", value.active ?? true);
      fd.append("replaceAllVariants", false);

      // Thời gian sale — format ISO không có Z để Spring parse được
      if (value.sale_range?.[0])
        fd.append("saleStart", value.sale_range[0].format("YYYY-MM-DDTHH:mm:ss"));
      else
        fd.append("saleStart", "");
      if (value.sale_range?.[1])
        fd.append("saleEnd", value.sale_range[1].format("YYYY-MM-DDTHH:mm:ss"));
      else
        fd.append("saleEnd", "");

      // Thumbnail
      if (thumbnailFile[0]?.originFileObj)
        fd.append("thumbnail", thumbnailFile[0].originFileObj);

      // Ảnh mới upload thêm
      const keptLen = existingImages.length;
      imagesFile.forEach((item, i) => {
        fd.append("images", item.file);
      });

      // Ảnh cũ giữ lại + gán color_id
      existingImages.forEach((img, i) => {
        let name = img.url.split("/").pop().split("?")[0];
        try { name = decodeURIComponent(name); } catch (_) {}
        fd.append("keptImages", name);
        fd.append(`imageColorIds[${i}]`, img.colorId ?? "");
      });
      // imageColorIds cho ảnh mới upload
      imagesFile.forEach((item, i) => {
        fd.append(`imageColorIds[${keptLen + i}]`, item.colorId ?? "");
      });

      // ── Sizes ──
      // Chỉ gửi size MỚI (id === null)
      const newSizes = sizes.filter((s) => s.id === null && s.name?.trim());
      newSizes.forEach((s, i) => fd.append(`sizes[${i}]`, s.name.trim()));

      // Sizes bị xoá
      deletedSizeIds.forEach((id) => fd.append("deleteSizeIds", id));

      // ── Colors mới (id === null) — gửi qua variants, BE tự tạo color ──
      // (color cũ đã có id, chỉ cần xử lý xoá)
      deletedColorIds.forEach((id) => fd.append("deleteColorIds", id));

      // ── Variants ──
      // BUG FIX: lọc đủ điều kiện — size_name phải có, color phải chọn (dù mới hay cũ)
      const validVariants = variants.filter(
        (v) =>
          v.size_name?.trim() && (v.color_id != null || v.color_name?.trim()),
      );

      validVariants.forEach((v, i) => {
        // Variant cũ (có id) → gửi colorProductId để BE biết cập nhật
        if (v.id != null) {
          fd.append(`variants[${i}].colorProductId`, v.id);
          fd.append(`variants[${i}].sizeId`, v.size_id ?? "");
          fd.append(`variants[${i}].sizeName`, v.size_name ?? "");
          fd.append(`variants[${i}].colorId`, v.color_id ?? "");
          fd.append(`variants[${i}].colorName`, v.color_name ?? "");
          fd.append(`variants[${i}].colorCode`, v.color_code ?? "");
          fd.append(`variants[${i}].stock`, v.stock ?? 0);
        } else {
          // Variant mới
          fd.append(`variants[${i}].sizeName`, v.size_name ?? "");
          fd.append(`variants[${i}].sizeId`, v.size_id ?? "");
          fd.append(`variants[${i}].colorId`, v.color_id ?? "");
          fd.append(`variants[${i}].colorName`, v.color_name ?? "");
          fd.append(`variants[${i}].colorCode`, v.color_code ?? "");
          fd.append(`variants[${i}].stock`, v.stock ?? 0);
        }
      });

      deletedVariantIds.forEach((id) => fd.append("deleteVariantIds", id));

      const token = getCookie("token");
      const res = await fetch(
        `${API_BASE_URL}/api/v1/products/admin/update/${record.id}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        },
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("❌ Server error:", errText);
        throw new Error(`Lỗi ${res.status}: ${errText}`);
      }

      const data = await res.json();
      console.log("✅ Success:", data);

      notiApi.success({ message: "Cập nhật thành công" });
      handleCancel();
      setTimeout(onReload, 800);
    } catch (err) {
      console.error("❌ Submit error:", err);
      notiApi.error({ message: "Cập nhật thất bại", description: err.message });
    } finally {
      setSpinning(false);
    }
  };

  // ── Columns bảng variant ───────────────────────────────────────────────────
  const variantColumns = [
    {
      title: "Size",
      width: "28%",
      render: (_, __, i) => (
        <Select
          size="small"
          style={{ width: "100%" }}
          placeholder="Chọn size"
          value={
            variants[i].size_id != null
              ? variants[i].size_id
              : variants[i].size_name || undefined
          }
          onChange={(val) => changeVariant(i, "size_id", val)}
          options={sizes
            .filter((s) => s.name?.trim())
            .map((s) => ({ value: s.id ?? s.name, label: s.name }))}
        />
      ),
    },
    {
      title: "Màu",
      width: "32%",
      render: (_, __, i) => (
        <Select
          size="small"
          style={{ width: "100%" }}
          placeholder="Chọn màu"
          // Với màu cũ dùng id, với màu mới (id=null) dùng color_name làm key
          value={
            variants[i].color_id != null
              ? variants[i].color_id
              : variants[i].color_name || undefined
          }
          onChange={(val) => changeVariant(i, "color_id", val)}
          options={colors
            .filter((c) => c.color_name?.trim())
            .map((c) => ({
              // Dùng id nếu có, không thì dùng color_name làm value
              value: c.id ?? c.color_name,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      background: c.color_code,
                      border: "1px solid #d9d9d9",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  {c.color_name}
                </span>
              ),
            }))}
        />
      ),
    },
    {
      title: "Tồn kho",
      width: "26%",
      render: (_, __, i) => (
        <InputNumber
          size="small"
          min={0}
          style={{ width: "100%" }}
          value={variants[i].stock}
          onChange={(val) => changeVariant(i, "stock", val ?? 0)}
        />
      ),
    },
    {
      title: "",
      width: "10%",
      render: (_, __, i) => (
        <Popconfirm
          title="Xoá biến thể này?"
          okText="Xoá"
          cancelText="Huỷ"
          onConfirm={() => deleteVariant(i)}
        >
          <Button type="link" danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const rules = [{ required: true, message: "Bắt buộc!" }];

  // ── Render ─────────────────────────────────────────────────────────────────
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
        <Spin spinning={spinning} tip="Đang xử lý...">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>
            {/* ── Thumbnail ── */}
            <Form.Item label="Ảnh đại diện (Thumbnail)">
              {record.thumbnail && thumbnailFile.length === 0 && (
                <img
                  src={record.thumbnail}
                  alt="thumb"
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
                maxCount={1}
                accept="image/*"
                onChange={({ fileList }) => setThumbnailFile(fileList)}
              >
                {thumbnailFile.length < 1 && <div>Thay ảnh</div>}
              </Upload>
            </Form.Item>

            {/* ── Album ── */}
            <Form.Item label="Ảnh mô tả (Album) — Gán màu cho từng ảnh">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 10, border: "1px dashed #d9d9d9", borderRadius: 8, background: "#fafafa", minHeight: 60 }}>

                {/* Ảnh cũ đã có */}
                {existingImages.map((img, idx) => (
                  <div key={`exist-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ position: "relative", width: 90, height: 90 }}>
                      <img src={img.url} alt={`img-${idx}`} crossOrigin="anonymous"
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, border: "1px solid #eee" }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                      {img.colorId && (() => {
                        const c = colors.find((c) => c.id === img.colorId);
                        return c ? (
                          <span style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: c.color_code, border: "1.5px solid #fff", boxShadow: "0 0 0 1px #aaa" }} />
                        ) : null;
                      })()}
                      <Button type="primary" danger size="small" icon={<DeleteOutlined />}
                        onClick={() => removeExistingImage(img.url)}
                        style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", padding: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                      />
                    </div>
                    <Select size="small" style={{ width: 90 }} placeholder="Màu" allowClear
                      value={img.colorId ?? undefined}
                      onChange={(val) => setExistingImageColor(img.url, val ?? null)}
                      options={[
                        ...colors.filter((c) => c.color_name?.trim()).map((c) => ({
                          label: (
                            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color_code, display: "inline-block", border: "1px solid #d9d9d9", flexShrink: 0 }} />
                              {c.color_name}
                            </span>
                          ),
                          value: c.id ?? c.color_name,
                        })),
                      ]}
                    />
                  </div>
                ))}

                {/* Ảnh mới upload */}
                {imagesFile.map((item, idx) => (
                  <div key={`new-${idx}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ position: "relative", width: 90, height: 90 }}>
                      <img src={item.previewUrl} alt={`new-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, border: "2px solid #1677ff" }}
                      />
                      {item.colorId && (() => {
                        const c = colors.find((c) => (c.id ?? c.color_name) === item.colorId);
                        return c ? (
                          <span style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: c.color_code, border: "1.5px solid #fff", boxShadow: "0 0 0 1px #aaa" }} />
                        ) : null;
                      })()}
                      <Button type="primary" danger size="small" icon={<DeleteOutlined />}
                        onClick={() => {
                          URL.revokeObjectURL(item.previewUrl);
                          setImagesFile((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        style={{ position: "absolute", top: -8, right: -8, width: 24, height: 24, borderRadius: "50%", padding: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                      />
                    </div>
                    <Select size="small" style={{ width: 90 }} placeholder="Màu" allowClear
                      value={item.colorId ?? undefined}
                      onChange={(val) => setImagesFile((prev) => prev.map((f, i) => i === idx ? { ...f, colorId: val ?? null } : f))}
                      options={colors.filter((c) => c.color_name?.trim()).map((c) => ({
                        label: (
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color_code, display: "inline-block", border: "1px solid #d9d9d9", flexShrink: 0 }} />
                            {c.color_name}
                          </span>
                        ),
                        value: c.id ?? c.color_name,
                      }))}
                    />
                  </div>
                ))}

                {/* Nút thêm ảnh */}
                <Upload accept="image/*" showUploadList={false} multiple
                  beforeUpload={(file) => {
                    const previewUrl = URL.createObjectURL(file);
                    setImagesFile((prev) => [...prev, { file, previewUrl, colorId: null }]);
                    return false;
                  }}
                >
                  <div style={{ width: 90, height: 90, border: "1px dashed #d9d9d9", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fff", gap: 4 }}>
                    <PlusOutlined style={{ fontSize: 18, color: "#999" }} />
                    <span style={{ fontSize: 12, color: "#999" }}>Thêm ảnh</span>
                  </div>
                </Upload>
              </div>
            </Form.Item>

            {/* ── Thông tin cơ bản ── */}
            <Form.Item label="Tên sản phẩm" name="name" rules={rules}>
              <Input />
            </Form.Item>
            <Form.Item label="Danh mục" name="category_id" rules={rules}>
              <Select
                placeholder="Chọn danh mục"
                loading={catLoading}
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
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(v) => v.replace(/\./g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giá bán" name="price" rules={rules}>
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(v) => v.replace(/\./g, "")}
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
                    formatter={(v) =>
                      v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
                    }
                    parser={(v) => v.replace(/\./g, "")}
                    placeholder="Để trống nếu không sale"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trọng lượng (gram)" name="weight">
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(v) =>
                      `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(v) => v.replace(/\./g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Thời gian sale"
              name="sale_range"
              help="Để trống nếu sale vĩnh viễn. Sau thời gian kết thúc, giá sẽ tự động về giá gốc."
            >
              <DatePicker.RangePicker
                showTime={{ format: "HH:mm" }}
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder={["Bắt đầu sale", "Kết thúc sale"]}
                allowEmpty={[true, true]}
              />
            </Form.Item>

            {/* ── Tabs Size / Màu / Biến thể ── */}
            {/* ── Tabs Size / Màu / Biến thể ── */}
            <Form.Item label="Quản lý size, màu & biến thể">
              <div
                style={{
                  border: "1px solid #e8e8e8",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <Tabs
                  defaultActiveKey="sizes"
                  style={{ padding: "0 16px" }}
                  items={[
                    /* ── Tab Size ── */
                    {
                      key: "sizes",
                      label: `Size (${sizes.length})`,
                      children: (
                        <div style={{ padding: "4px 0 12px" }}>
                          <div
                            style={{
                              maxHeight: 240,
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {sizes.length === 0 && (
                              <div
                                style={{
                                  textAlign: "center",
                                  color: "#bbb",
                                  padding: "24px 0",
                                  fontSize: 13,
                                }}
                              >
                                Chưa có size nào
                              </div>
                            )}
                            {sizes.map((s, i) => (
                              <div
                                key={i}
                                style={{
                                  display: "flex",
                                  gap: 8,
                                  marginBottom: 8,
                                  alignItems: "center",
                                  background: "#fafafa",
                                  borderRadius: 8,
                                  padding: "8px 12px",
                                  border: "1px solid #f0f0f0",
                                }}
                              >
                                <span
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    background: "#e6f4ff",
                                    color: "#1677ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <Input
                                  placeholder="Tên size (VD: 40, M, L)"
                                  value={s.name}
                                  onChange={(e) =>
                                    changeSizeName(i, e.target.value)
                                  }
                                  variant="borderless"
                                  style={{ flex: 1, fontWeight: 500 }}
                                />
                                <Popconfirm
                                  title="Xoá size? Biến thể liên quan cũng bị xoá."
                                  okText="Xoá"
                                  cancelText="Huỷ"
                                  onConfirm={() => deleteSize(i)}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    style={{ opacity: 0.75 }}
                                  />
                                </Popconfirm>
                              </div>
                            ))}
                          </div>
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={addSize}
                            style={{
                              width: "100%",
                              marginTop: 8,
                              borderRadius: 8,
                              height: 38,
                            }}
                          >
                            Thêm size
                          </Button>
                        </div>
                      ),
                    },

                    /* ── Tab Màu ── */
                    {
                      key: "colors",
                      label: `Màu sắc (${colors.length})`,
                      children: (
                        <div style={{ padding: "4px 0 12px" }}>
                          {/* Form thêm màu */}
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              marginBottom: 12,
                              alignItems: "center",
                              background: "#f8f9fa",
                              borderRadius: 8,
                              padding: "10px 12px",
                              border: "1px solid #e8e8e8",
                            }}
                          >
                            <Input
                              placeholder="Tên màu (VD: Đỏ, Xanh navy)"
                              value={newColorName}
                              onChange={(e) => setNewColorName(e.target.value)}
                              onPressEnter={addColor}
                              style={{ flex: 1, borderRadius: 6 }}
                            />
                            <ColorPicker
                              value={newColorCode}
                              showText
                              onChange={(c) => setNewColorCode(c.toHexString())}
                            />
                            <Button
                              type="primary"
                              icon={<PlusOutlined />}
                              onClick={addColor}
                              style={{ borderRadius: 6 }}
                            >
                              Thêm
                            </Button>
                          </div>

                          {/* Danh sách màu */}
                          <div
                            style={{
                              maxHeight: 200,
                              overflowY: "auto",
                              paddingRight: 4,
                            }}
                          >
                            {colors.length === 0 ? (
                              <div
                                style={{
                                  textAlign: "center",
                                  color: "#bbb",
                                  padding: "24px 0",
                                  fontSize: 13,
                                }}
                              >
                                Chưa có màu nào
                              </div>
                            ) : (
                              colors.map((c, i) => (
                                <div
                                  key={i}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "9px 12px",
                                    marginBottom: 6,
                                    background: "#fafafa",
                                    borderRadius: 8,
                                    border: "1px solid #f0f0f0",
                                  }}
                                >
                                  <span
                                    style={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: "50%",
                                      background: c.color_code,
                                      border: "2px solid #fff",
                                      boxShadow: "0 0 0 1px #d9d9d9",
                                      display: "inline-block",
                                      flexShrink: 0,
                                    }}
                                  />
                                  <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>
                                    {c.color_name}
                                  </span>
                                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#888", background: "#f0f0f0", padding: "2px 7px", borderRadius: 4 }}>
                                    {c.color_code}
                                  </span>
                                  {!c.id && <Tag color="green" style={{ fontSize: 10, margin: 0 }}>Mới</Tag>}

                                  <Popconfirm title="Xoá màu? Biến thể liên quan cũng bị xoá." okText="Xoá" cancelText="Huỷ" onConfirm={() => deleteColor(i)}>
                                    <Button type="text" danger size="small" icon={<DeleteOutlined />} style={{ opacity: 0.75 }} />
                                  </Popconfirm>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ),
                    },

                    /* ── Tab Biến thể ── */
                    {
                      key: "variants",
                      label: `Biến thể (${variants.length})`,
                      children: (
                        <div style={{ padding: "4px 0 12px" }}>
                          <Table
                            size="small"
                            dataSource={variants.map((v, i) => ({
                              ...v,
                              key: i,
                            }))}
                            columns={variantColumns}
                            pagination={false}
                            scroll={{ y: 220 }}
                            locale={{ emptyText: "Chưa có biến thể nào" }}
                            style={{ borderRadius: 8, overflow: "hidden" }}
                          />
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={addVariant}
                            disabled={sizes.length === 0 || colors.length === 0}
                            style={{
                              width: "100%",
                              marginTop: 8,
                              borderRadius: 8,
                              height: 38,
                            }}
                          >
                            Thêm biến thể
                            {(sizes.length === 0 || colors.length === 0) &&
                              " (cần có size và màu)"}
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
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
