
import { EyeOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Image, Row, Col, Tag, Table, Tabs } from "antd";
import { useState } from "react";
import dayjs from "dayjs";

function ViewProduct(props) {
  const { record } = props;
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  const formatPrice = (value) =>
    typeof value === "number" ? value.toLocaleString("vi-VN") + " đ" : "0 đ";

  const formatWeight = (value) => {
    if (!value) return "—";
    return value < 1000
      ? `${value.toLocaleString("vi-VN")} g`
      : `${(value / 1000).toLocaleString("vi-VN")} kg`;
  };

  const handleShowModal = () => {
    setShowModal(true);
    form.setFieldsValue({
      ...record,
      birthDate: record.birthDate ? dayjs(record.birthDate) : null,
      cost:          formatPrice(record.cost),
      price:         formatPrice(record.price),
      display_price: formatPrice(record.display_price),
      weight:        formatWeight(record.weight),
    });
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };

  // ── Columns bảng variant ──
  const variantColumns = [
    {
      title: "Size", dataIndex: "size_name", width: "30%",
      render: (v) => <span style={{ fontWeight: 500 }}>{v || "—"}</span>,
    },
    {
      title: "Màu", width: "40%",
      render: (_, row) => (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {row.color_code && (
            <span style={{
              width: 14, height: 14, borderRadius: "50%",
              background: row.color_code, border: "1px solid #d9d9d9",
              display: "inline-block", flexShrink: 0,
            }} />
          )}
          {row.color_name || "—"}
        </span>
      ),
    },
    {
      title: "Tồn kho", dataIndex: "stock", width: "25%",
      render: (v) => (
        <Tag color={v > 0 ? "green" : "red"} style={{ fontWeight: 600 }}>
          {v ?? 0}
        </Tag>
      ),
    },
  ];

  return (
    <>
      <Button
        size="small" type="text" style={{ color: "black" }}
        icon={<EyeOutlined />} onClick={handleShowModal}
      />

      <Modal
        title="Xem thông tin sản phẩm"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} destroyOnClose disabled>

          {/* ── Ảnh sản phẩm ── */}
          <Form.Item label="Ảnh sản phẩm">
            {record.thumbnail ? (
              <Image crossOrigin="anonymous" src={record.thumbnail} alt="thumbnail"
                width={80} height={80}
                style={{ objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
            ) : (
              <span>Không có ảnh</span>
            )}
          </Form.Item>

          {/* ── Ảnh mô tả ── */}
          <Form.Item label="Ảnh mô tả">
            {Array.isArray(record.images) && record.images.length > 0 ? (
              <Image.PreviewGroup>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {record.images.map((url, index) => (
                    <Image key={index} crossOrigin="anonymous" src={url}
                      alt={`image-${index}`} width={80} height={80}
                      style={{ objectFit: "cover", borderRadius: 4, border: "1px solid #eee" }} />
                  ))}
                </div>
              </Image.PreviewGroup>
            ) : (
              <span>Không có ảnh mô tả</span>
            )}
          </Form.Item>

          {/* ── Thông tin cơ bản ── */}
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

          {/* ── Tabs Size / Màu / Biến thể (thay thế Bảng size + Tồn kho) ── */}
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
                  label: `Size (${record.sizes?.length ?? 0})`,
                  children: (
                    <div style={{ padding: "4px 0 12px" }}>
                      {!record.sizes?.length ? (
                        <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 13 }}>
                          Chưa có size nào
                        </div>
                      ) : (
                        <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 4 }}>
                          {record.sizes.map((s, i) => (
                            <div key={i} style={{
                              display: "flex", gap: 10, alignItems: "center",
                              background: "#fafafa", borderRadius: 8,
                              padding: "8px 12px", marginBottom: 8, border: "1px solid #f0f0f0",
                            }}>
                              <span style={{
                                width: 28, height: 28, borderRadius: 6,
                                background: "#e6f4ff", color: "#1677ff",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700, flexShrink: 0,
                              }}>
                                {i + 1}
                              </span>
                              <span style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },

                /* ── Tab Màu ── */
                {
                  key: "colors",
                  label: `Màu sắc (${record.colors?.length ?? 0})`,
                  children: (
                    <div style={{ padding: "4px 0 12px" }}>
                      {!record.colors?.length ? (
                        <div style={{ textAlign: "center", color: "#bbb", padding: "24px 0", fontSize: 13 }}>
                          Chưa có màu nào
                        </div>
                      ) : (
                        <div style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                          {record.colors.map((c, i) => (
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
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                },

                /* ── Tab Biến thể ── */
                {
                  key: "variants",
                  label: `Biến thể (${record.variants?.length ?? 0})`,
                  children: (
                    <div style={{ padding: "4px 0 12px" }}>
                      <Table
                        size="small"
                        dataSource={(record.variants ?? []).map((v, i) => ({ ...v, key: i }))}
                        columns={variantColumns}
                        pagination={false}
                        scroll={{ y: 220 }}
                        locale={{ emptyText: "Chưa có biến thể nào" }}
                        style={{ borderRadius: 8, overflow: "hidden" }}
                      />
                      {/* Tổng tồn kho */}
                      <div style={{
                        marginTop: 10, padding: "8px 12px",
                        background: "#f6ffed", border: "1px solid #b7eb8f",
                        borderRadius: 8, display: "flex", justifyContent: "space-between",
                        alignItems: "center",
                      }}>
                        <span style={{ fontSize: 13, color: "#555" }}>Tổng tồn kho</span>
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#389e0d" }}>
                          {record.total_stock ?? 0} đôi
                        </span>
                      </div>
                    </div>
                  ),
                },
              ]} />
            </div>
          </Form.Item>

          {/* ── Ngày tạo / Ngày cập nhật ── */}
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