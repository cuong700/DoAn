
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  Button, Col, Form, Input, InputNumber, Modal, notification,
  Row, Select, Spin, Upload, ColorPicker, Table, Tag, Popconfirm, Tabs, DatePicker,
} from "antd";
import { useEffect, useState } from "react";
import "./ProductManagement.css";
import { getCookie } from "../../../helpers/cookie";
import dayjs from "dayjs";

function CreateProduct({ onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [spinning, setSpinning]   = useState(false);
  const [notiApi, contextHolder]  = notification.useNotification();
  const [form]                    = Form.useForm();

  const [loading, setLoading]       = useState(false);
  const [categories, setCategories] = useState([]);

  // Ảnh
  const [thumbnailFile, setThumbnailFile] = useState([]);
  // Ảnh album mới: [{ file: File, previewUrl: string, colorId: null }]
  const [imagesFile, setImagesFile] = useState([]);

  // Size / Color / Variant
  const [sizes,    setSizes]    = useState([]);
  const [colors,   setColors]   = useState([]);
  const [variants, setVariants] = useState([]);

  // Form thêm màu mới
  const [newColorName, setNewColorName] = useState("");
  const [newColorCode, setNewColorCode] = useState("#000000");

  // ── Fetch danh mục ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const token = getCookie("token");
        const res = await fetch(
          "http://localhost:8090/api/v1/categories/public/search?active=true",
          { method: "GET", headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Không lấy được danh mục");
        const json = await res.json();
        setCategories(
          json.data.content
            .filter((item) => item.active)
            .map((item) => ({ value: item.id, label: item.name }))
        );
      } catch (error) {
        notiApi.error({ message: "Lỗi tải danh mục sản phẩm", description: "Vui lòng thử lại sau." });
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, []);

  // ── Reset toàn bộ state ─────────────────────────────────────────────────────
  const resetAll = () => {
    form.resetFields();
    setThumbnailFile([]);
    imagesFile.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
    setImagesFile([]);
    setSizes([]);
    setColors([]);
    setVariants([]);
    setNewColorName("");
    setNewColorCode("#000000");
  };

  const handleShowModal = () => setShowModal(true);

  const handleCancel = () => {
    setShowModal(false);
    resetAll();
  };

  // ── Size ───────────────────────────────────────────────────────────────────
  const addSize = () =>
    setSizes((prev) => [...prev, { name: "" }]);

  const changeSizeName = (index, value) =>
    setSizes((prev) => prev.map((s, i) => (i === index ? { ...s, name: value } : s)));

  const deleteSize = (index) => {
    const s = sizes[index];
    // Xoá variants liên quan (theo size_name vì size mới chưa có id)
    setVariants((p) => p.filter((v) => v.size_name !== s.name));
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
      { color_name: newColorName.trim(), color_code: newColorCode },
    ]);
    setNewColorName("");
    setNewColorCode("#000000");
  };

  const deleteColor = (index) => {
    const c = colors[index];
    setVariants((p) => p.filter((v) => v.color_name !== c.color_name));
    setColors((p) => p.filter((_, i) => i !== index));
  };

  // ── Variant ────────────────────────────────────────────────────────────────
  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { size_name: "", color_name: "", color_code: "", stock: 0 },
    ]);

  const changeVariant = (index, field, value) => {
    setVariants((prev) => {
      const next = [...prev];
      if (field === "size_name") {
        next[index] = { ...next[index], size_name: value };
      } else if (field === "color_name") {
        const found = colors.find((c) => c.color_name === value);
        next[index] = {
          ...next[index],
          color_name: found?.color_name ?? "",
          color_code: found?.color_code ?? "",
        };
      } else {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const deleteVariant = (index) =>
    setVariants((p) => p.filter((_, i) => i !== index));

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (value) => {
    try {
      setSpinning(true);
      const token    = getCookie("token");
      const formData = new FormData();

      formData.append("name",        value.name);
      formData.append("price",       value.price);
      formData.append("cost",        value.cost);
      if (value.display_price != null && value.display_price !== "")
        formData.append("originalPrice", value.display_price);
      formData.append("weight",      value.weight ?? 0);
      formData.append("categoryId",  value.category_id);
      formData.append("description", value.description || "");

      // Thời gian sale — format ISO không có Z để Spring parse được
      if (value.sale_range?.[0])
        formData.append("saleStart", value.sale_range[0].format("YYYY-MM-DDTHH:mm:ss"));
      if (value.sale_range?.[1])
        formData.append("saleEnd", value.sale_range[1].format("YYYY-MM-DDTHH:mm:ss"));

      // Thumbnail
      if (thumbnailFile[0]?.originFileObj)
        formData.append("thumbnail", thumbnailFile[0].originFileObj);

      // Album + imageColorIds
      imagesFile.forEach((item, i) => {
        formData.append("images", item.file);
        formData.append(`imageColorIds[${i}]`, item.colorId ?? "");
      });

      // Sizes
      const validSizes = sizes.filter((s) => s.name?.trim());
      validSizes.forEach((s) => formData.append("sizes", s.name.trim()));

      // Variants
      const validVariants = variants.filter(
        (v) => v.size_name?.trim() && v.color_name?.trim()
      );
      validVariants.forEach((v, i) => {
        formData.append(`variants[${i}].sizeName`,  v.size_name);
        formData.append(`variants[${i}].colorName`, v.color_name);
        formData.append(`variants[${i}].colorCode`, v.color_code);
        formData.append(`variants[${i}].stock`,     v.stock ?? 0);
      });

      const res = await fetch(
        "http://localhost:8090/api/v1/products/admin/create",
        { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
      );

      if (!res.ok) throw new Error("Thêm sản phẩm thất bại");

      notiApi.success({ message: "Thêm mới thành công", description: "Sản phẩm đã được thêm." });
      setShowModal(false);
      resetAll();
      setTimeout(onReload, 500);
    } catch (error) {
      notiApi.error({ message: "Lỗi thêm sản phẩm", description: "Vui lòng kiểm tra lại thông tin." });
    } finally {
      setSpinning(false);
    }
  };

  // ── Columns bảng variant ───────────────────────────────────────────────────
  const variantColumns = [
    {
      title: "Size", width: "28%",
      render: (_, __, i) => (
        <Select
          size="small" style={{ width: "100%" }} placeholder="Chọn size"
          value={variants[i].size_name || undefined}
          onChange={(val) => changeVariant(i, "size_name", val)}
          options={sizes
            .filter((s) => s.name?.trim())
            .map((s) => ({ value: s.name, label: s.name }))}
        />
      ),
    },
    {
      title: "Màu", width: "32%",
      render: (_, __, i) => (
        <Select
          size="small" style={{ width: "100%" }} placeholder="Chọn màu"
          value={variants[i].color_name || undefined}
          onChange={(val) => changeVariant(i, "color_name", val)}
          options={colors
            .filter((c) => c.color_name?.trim())
            .map((c) => ({
              value: c.color_name,
              label: (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: c.color_code, border: "1px solid #d9d9d9",
                    display: "inline-block", flexShrink: 0,
                  }} />
                  {c.color_name}
                </span>
              ),
            }))}
        />
      ),
    },
    {
      title: "Tồn kho", width: "26%",
      render: (_, __, i) => (
        <InputNumber
          size="small" min={0} style={{ width: "100%" }}
          value={variants[i].stock}
          onChange={(val) => changeVariant(i, "stock", val ?? 0)}
        />
      ),
    },
    {
      title: "", width: "10%",
      render: (_, __, i) => (
        <Popconfirm title="Xoá biến thể này?" okText="Xoá" cancelText="Huỷ"
          onConfirm={() => deleteVariant(i)}>
          <Button type="text" danger size="small" icon={<DeleteOutlined />} style={{ opacity: 0.75 }} />
        </Popconfirm>
      ),
    },
  ];

  const rules = [{ required: true, message: "Bắt buộc!" }];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {contextHolder}
      <Button type="primary" icon={<PlusOutlined />} className="btn-add1" onClick={handleShowModal}>
        Thêm mới
      </Button>

      <Modal
        title="Thêm sản phẩm mới"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Spin spinning={spinning} tip="Đang thêm...">
          <Form layout="vertical" form={form} onFinish={handleSubmit}>

            {/* ── Thumbnail ── */}
            <Form.Item label="Ảnh sản phẩm" name="thumbnail" rules={rules}>
              <Upload listType="picture-card" fileList={thumbnailFile}
                beforeUpload={() => false} maxCount={1} accept="image/*"
                onChange={({ fileList }) => setThumbnailFile(fileList)}>
                {thumbnailFile.length < 1 && <div>Chọn ảnh</div>}
              </Upload>
            </Form.Item>

            {/* ── Album ── */}
            <Form.Item label="Ảnh mô tả — Gán màu cho từng ảnh">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 10, border: "1px dashed #d9d9d9", borderRadius: 8, background: "#fafafa", minHeight: 60 }}>
                {imagesFile.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ position: "relative", width: 90, height: 90 }}>
                      <img src={item.previewUrl} alt={`new-${idx}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4, border: "2px solid #1677ff" }}
                      />
                      {item.colorId && (() => {
                        const c = colors.find((c) => c.color_name === item.colorId || c.color_name === item.colorId);
                        return c ? <span style={{ position: "absolute", bottom: 4, right: 4, width: 14, height: 14, borderRadius: "50%", background: c.color_code, border: "1.5px solid #fff", boxShadow: "0 0 0 1px #aaa" }} /> : null;
                      })()}
                      <Button type="primary" danger size="small" icon={<DeleteOutlined />}
                        onClick={() => { URL.revokeObjectURL(item.previewUrl); setImagesFile((prev) => prev.filter((_, i) => i !== idx)); }}
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
                        value: c.color_name,
                      }))}
                    />
                  </div>
                ))}
                <Upload accept="image/*" showUploadList={false} multiple
                  beforeUpload={(file) => {
                    const previewUrl = URL.createObjectURL(file);
                    setImagesFile((prev) => [...prev, { file, previewUrl, colorId: null }]);
                    return false;
                  }}
                >
                  <div style={{ width: 90, height: 90, border: "1px dashed #d9d9d9", borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "#fff", gap: 4 }}>
                    <PlusOutlined style={{ fontSize: 18, color: "#999" }} />
                    <span style={{ fontSize: 12, color: "#999" }}>Chọn ảnh</span>
                  </div>
                </Upload>
              </div>
            </Form.Item>

            {/* ── Thông tin cơ bản ── */}
            <Form.Item label="Tên sản phẩm" name="name" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Danh mục" name="category_id" rules={rules}>
              <Select placeholder="Chọn danh mục" loading={loading} options={categories} />
            </Form.Item>

            <Form.Item label="Mô tả" name="description" rules={rules}>
              <Input.TextArea rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giá nhập" name="cost" rules={rules}>
                  <InputNumber min={0} style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    parser={(v) => v.replace(/\./g, "")} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Giá bán" name="price" rules={rules}>
                  <InputNumber min={0} style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    parser={(v) => v.replace(/\./g, "")} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Giá sale (nếu có)" name="display_price">
                  <InputNumber min={0} style={{ width: "100%" }}
                    formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""}
                    parser={(v) => v.replace(/\./g, "")}
                    placeholder="Để trống nếu không sale" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Trọng lượng (gram)" name="weight">
                  <InputNumber min={0} style={{ width: "100%" }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                    parser={(v) => v.replace(/\./g, "")} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Thời gian sale"
              name="sale_range"
              help="Để trống nếu sale vĩnh viễn (không giới hạn thời gian)"
            >
              <DatePicker.RangePicker
                showTime={{ format: "HH:mm" }}
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder={["Bắt đầu sale", "Kết thúc sale"]}
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </Form.Item>

            {/* ── Tabs Size / Màu / Biến thể ── */}
            <Form.Item label="Quản lý size, màu & biến thể">
              <div style={{
                border: "1px solid #e8e8e8", borderRadius: 10,
                overflow: "hidden", background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <Tabs defaultActiveKey="sizes" style={{ padding: "0 16px" }} items={[

                  /* ── Tab Size ── */
                  {
                    key: "sizes",
                    label: `Size (${sizes.length})`,
                    children: (
                      <div style={{ padding: "4px 0 12px" }}>
                        <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                          {sizes.length === 0 && (
                            <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 13 }}>
                              Chưa có size nào
                            </div>
                          )}
                          {sizes.map((s, i) => (
                            <div key={i} style={{
                              display: "flex", gap: 8, marginBottom: 8, alignItems: "center",
                              background: "#fafafa", borderRadius: 8,
                              padding: "8px 12px", border: "1px solid #f0f0f0",
                            }}>
                              <span style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: "#e6f4ff", color: "#1677ff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, flexShrink: 0,
                              }}>
                                {i + 1}
                              </span>
                              <Input
                                placeholder="Tên size (VD: 40, M, L)"
                                value={s.name}
                                onChange={(e) => changeSizeName(i, e.target.value)}
                                variant="borderless"
                                style={{ flex: 1, fontWeight: 500 }}
                              />
                              <Popconfirm
                                title="Xoá size? Biến thể liên quan cũng bị xoá."
                                okText="Xoá" cancelText="Huỷ"
                                onConfirm={() => deleteSize(i)}>
                                <Button type="text" danger size="small"
                                  icon={<DeleteOutlined />} style={{ opacity: 0.75 }} />
                              </Popconfirm>
                            </div>
                          ))}
                        </div>
                        <Button type="dashed" icon={<PlusOutlined />} onClick={addSize}
                          style={{ width: "100%", marginTop: 8, borderRadius: 8, height: 38 }}>
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
                        <div style={{
                          display: "flex", gap: 8, marginBottom: 12, alignItems: "center",
                          background: "#f8f9fa", borderRadius: 8, padding: "10px 12px",
                          border: "1px solid #e8e8e8",
                        }}>
                          <Input
                            placeholder="Tên màu (VD: Đỏ, Xanh navy)"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            onPressEnter={addColor}
                            style={{ flex: 1, borderRadius: 6 }}
                          />
                          <ColorPicker value={newColorCode} showText
                            onChange={(c) => setNewColorCode(c.toHexString())} />
                          <Button type="primary" icon={<PlusOutlined />} onClick={addColor}
                            style={{ borderRadius: 6 }}>
                            Thêm
                          </Button>
                        </div>

                        {/* Danh sách màu */}
                        <div style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                          {colors.length === 0 ? (
                            <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 13 }}>
                              Chưa có màu nào
                            </div>
                          ) : (
                            colors.map((c, i) => (
                              <div key={i} style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: "9px 12px", marginBottom: 6,
                                background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0",
                              }}>
                                <span style={{
                                  width: 28, height: 28, borderRadius: "50%",
                                  background: c.color_code,
                                  border: "2px solid #fff", boxShadow: "0 0 0 1px #d9d9d9",
                                  display: "inline-block", flexShrink: 0,
                                }} />
                                <span style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>
                                  {c.color_name}
                                </span>
                                <span style={{
                                  fontFamily: "monospace", fontSize: 11, color: "#888",
                                  background: "#f0f0f0", padding: "2px 7px", borderRadius: 4,
                                }}>
                                  {c.color_code}
                                </span>
                                <Tag color="green" style={{ fontSize: 10, margin: 0 }}>Mới</Tag>
                                <Popconfirm title="Xoá màu? Biến thể liên quan cũng bị xoá."
                                  okText="Xoá" cancelText="Huỷ" onConfirm={() => deleteColor(i)}>
                                  <Button type="text" danger size="small"
                                    icon={<DeleteOutlined />} style={{ opacity: 0.75 }} />
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
                          dataSource={variants.map((v, i) => ({ ...v, key: i }))}
                          columns={variantColumns}
                          pagination={false}
                          scroll={{ y: 220 }}
                          locale={{ emptyText: "Chưa có biến thể nào" }}
                          style={{ borderRadius: 8, overflow: "hidden" }}
                        />
                        <Button type="dashed" icon={<PlusOutlined />} onClick={addVariant}
                          disabled={sizes.length === 0 || colors.length === 0}
                          style={{ width: "100%", marginTop: 8, borderRadius: 8, height: 38 }}>
                          Thêm biến thể
                          {(sizes.length === 0 || colors.length === 0) && " (cần có size và màu)"}
                        </Button>
                      </div>
                    ),
                  },
                ]} />
              </div>
            </Form.Item>

            <Form.Item style={{ marginTop: 20, textAlign: "right" }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={spinning}>Thêm mới</Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}

export default CreateProduct;