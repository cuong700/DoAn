import {
  Button,
  Input,
  notification,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import "./ShopConfig.css";

// Nhãn hiển thị thân thiện cho từng config key
const KEY_LABELS = {
  name: "Tên cửa hàng",
  hotline: "Hotline",
  email: "Email hỗ trợ",
  address: "Địa chỉ",
  guarantee: "Chính sách bảo hành",
  return_policy: "Chính sách đổi trả",
  shipping: "Thông tin vận chuyển",
  payment: "Phương thức thanh toán",
};

// Các key mặc định nếu chưa có trong DB
const DEFAULT_CONFIGS = [
  { configKey: "name",          configValue: "SOLEUP",                                                          description: "Tên cửa hàng" },
  { configKey: "hotline",       configValue: "1800-SOLEUP",                                                     description: "Số hotline" },
  { configKey: "email",         configValue: "support@soleup.vn",                                               description: "Email hỗ trợ" },
  { configKey: "address",       configValue: "Việt Nam",                                                        description: "Địa chỉ cửa hàng" },
  { configKey: "guarantee",     configValue: "100% chính hãng, có tem chống hàng giả",                         description: "Chính sách bảo hành" },
  { configKey: "return_policy", configValue: "Đổi trả trong 7 ngày nếu lỗi sản xuất",                          description: "Chính sách đổi trả" },
  { configKey: "shipping",      configValue: "Giao hàng toàn quốc 2-5 ngày làm việc, miễn phí ship đơn từ 500k", description: "Thông tin vận chuyển" },
  { configKey: "payment",       configValue: "COD (tiền mặt khi nhận), MoMo",                                  description: "Phương thức thanh toán" },
];

// Normalize 1 item từ BE (có thể là camelCase hoặc snake_case)
const normalize = (item) => ({
  configKey:   item.configKey   ?? item.config_key   ?? "",
  configValue: item.configValue ?? item.config_value ?? "",
  description: item.description ?? "",
});

function ShopConfig() {
  const [loading, setLoading]       = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingKey, setSavingKey]   = useState(null);
  const [notiApi, contextHolder]    = notification.useNotification();

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const res = await fetch("http://localhost:8090/api/v1/chatbot/admin/config", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Không lấy được cấu hình");

      const json = await res.json();
      // BE trả về array trong data
      const dbConfigs = (json?.data || []).map(normalize);

      // Merge: ưu tiên giá trị từ DB, fallback về default
      const merged = DEFAULT_CONFIGS.map((def) => {
        const found = dbConfigs.find((d) => d.configKey === def.configKey);
        return found
          ? { ...def, configValue: found.configValue, description: found.description || def.description }
          : { ...def };
      });

      // Thêm các key từ DB không có trong DEFAULT_CONFIGS
      dbConfigs.forEach((d) => {
        if (!merged.find((m) => m.configKey === d.configKey)) {
          merged.push(d);
        }
      });

      setDataSource(merged.map((c) => ({ ...c, key: c.configKey })));
    } catch (error) {
      console.error("fetchConfigs error:", error);
      // Fallback về default
      setDataSource(DEFAULT_CONFIGS.map((c) => ({ ...c, key: c.configKey })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleEdit = (record) => {
    setEditingKey(record.configKey);
    setEditingValue(record.configValue || "");
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingValue("");
  };

  const handleSave = async (configKey) => {
    try {
      setSavingKey(configKey);
      const token = getCookie("token");

      const res = await fetch(
        `http://localhost:8090/api/v1/chatbot/admin/config/${configKey}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Gửi qua body để tránh lỗi encode tiếng Việt
          body: JSON.stringify({ value: editingValue }),
        }
      );

      if (!res.ok) throw new Error("Lưu thất bại");

      notiApi.success({
        message: "Lưu thành công",
        description: `Đã cập nhật: ${KEY_LABELS[configKey] || configKey}`,
      });

      setEditingKey(null);
      setEditingValue("");
      fetchConfigs();
    } catch (error) {
      console.error("handleSave error:", error);
      notiApi.error({
        message: "Lỗi lưu cấu hình",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const columns = [
    {
      title: "Tên cấu hình",
      dataIndex: "configKey",
      key: "configKey",
      width: 220,
      render: (key) => (
        <span>
          <Tag color="blue" style={{ marginRight: 8 }}>{key}</Tag>
          <span style={{ color: "#555" }}>{KEY_LABELS[key] || ""}</span>
        </span>
      ),
    },
    {
      title: "Giá trị",
      dataIndex: "configValue",
      key: "configValue",
      render: (value, record) => {
        if (editingKey === record.configKey) {
          return (
            <Input.TextArea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              autoSize={{ minRows: 1, maxRows: 4 }}
              style={{ width: "100%" }}
              onPressEnter={(e) => {
                // Shift+Enter xuống dòng, Enter đơn lưu
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSave(record.configKey);
                }
              }}
            />
          );
        }
        return <span style={{ whiteSpace: "pre-wrap" }}>{value || "—"}</span>;
      },
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 200,
      render: (text) => <span style={{ color: "#888" }}>{text || "—"}</span>,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => {
        const isEditing = editingKey === record.configKey;
        return isEditing ? (
          <Space>
            <Tooltip title="Lưu (Enter)">
              <Button
                size="small"
                type="text"
                style={{ color: "#52c41a" }}
                icon={<SaveOutlined />}
                loading={savingKey === record.configKey}
                onClick={() => handleSave(record.configKey)}
              />
            </Tooltip>
            <Tooltip title="Huỷ">
              <Button
                size="small"
                type="text"
                style={{ color: "#ff4d4f" }}
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
              />
            </Tooltip>
          </Space>
        ) : (
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              type="text"
              style={{ color: "#1677ff" }}
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <h2 className="shop-config__title">Cấu hình cửa hàng</h2>
      <p className="shop-config__desc">
        Quản lý thông tin hiển thị của cửa hàng. Các thông tin này được dùng trong chatbot và trang giới thiệu.
      </p>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey="configKey"
          pagination={false}
          scroll={{ x: 700 }}
        />
      </Spin>
    </>
  );
}

export default ShopConfig;
