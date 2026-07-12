
import { Image, Select, Space, Table, Tooltip, Input, Tag } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";
import CreateProduct from "./CreateProduct";
import ViewProduct from "./ViewProduct";
import { getCookie } from "../../../helpers/cookie";
import ImportProduct from "./ImportProduct";
import API_BASE_URL from '../../../config/api';

const { Search } = Input;

function ProductManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 4,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ĐANG_HOAT_DONG");

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  // Fetch chi tiết 1 sản phẩm 
  const fetchProductDetail = async (id) => {
    try {
      const token = getCookie("token");
      const res = await fetch(
        `${API_BASE_URL}/api/v1/products/public/${id}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error(`Lỗi ${res.status}`);
      const json = await res.json();
      return json?.data ?? json;
    } catch (err) {
      console.error(`Lỗi fetch detail product ${id}:`, err);
      return null;
    }
  };

  const fetchApi = async (
    searchText = "",
    current = 1,
    pageSize = 4,
    status = "ĐANG_HOAT_DONG",
  ) => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const params = new URLSearchParams({
        keyword: searchText || "",
        page: String(current - 1),
        limit: String(pageSize),
      });
      if (status === "ĐANG_HOAT_DONG") params.append("active", "true");
      else if (status === "NGUNG_HOAT_DONG") params.append("active", "false");

      const res = await fetch(
        `${API_BASE_URL}/api/v1/products/public/search?${params.toString()}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error("Không lấy được danh sách sản phẩm");

      const json = await res.json();
      console.log("ProductManagement API response:", json);
      const products = (json?.data || []).sort((a, b) => b.id - a.id);

      // Dùng thẳng data từ search, không fetch detail song song để tránh lỗi
      const productsWithDetail = products.map((product) => ({
        ...product,
        thumbnail: buildImageUrl(product.thumbnail),
        images: [],
        sizes: [],
        colors: [],
        variants: [],
      }));

      setDataSource(productsWithDetail);
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total: json?.total_elements || 0,
      }));
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm!", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi("", pagination.current, pagination.pageSize, statusFilter);
  }, []);

  const handleReload = () =>
    fetchApi(keyword, pagination.current, pagination.pageSize, statusFilter);

  const handleSearch = (value) => {
    const trimmed = value.trim();
    setKeyword(trimmed);
    setPagination((p) => ({ ...p, current: 1 }));
    fetchApi(trimmed, 1, pagination.pageSize, statusFilter);
  };

  const columns = [
    {
      title: "STT",
      fixed: "left",
      width: 60,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Ảnh sản phẩm",
      dataIndex: "thumbnail",
      key: "thumbnail",
      fixed: "left",
      width: 130,
      render: (url) => (
        <Image
          src={url}
          alt="product"
          crossOrigin="anonymous"
          style={{
            width: 100,
            height: 100,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
      ),
    },
    {
      title: "Ảnh mô tả",
      dataIndex: "images",
      key: "images",
      hidden: true,
      width: 180,
      render: (images) => {
        if (!Array.isArray(images) || images.length === 0) return "—";
        return (
          <Image.PreviewGroup>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {images.map((url, i) => (
                <Image
                  key={i}
                  src={url}
                  alt={`mô tả-${i}`}
                  crossOrigin="anonymous"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        );
      },
    },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name", width: 150 },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      key: "category_name",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 250,
      render: (text) => {
        if (!text) return null;
        const short = text.length > 50 ? text.slice(0, 50) + "..." : text;
        return (
          <Tooltip title={text}>
            <span>{short}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Giá nhập",
      dataIndex: "cost",
      key: "cost",
      width: 130,
      render: (v) =>
        typeof v === "number" ? v.toLocaleString("vi-VN") + " đ" : "0 đ",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (v) =>
        typeof v === "number" ? v.toLocaleString("vi-VN") + " đ" : "0 đ",
    },
    {
      title: "Giá sale",
      dataIndex: "display_price",
      key: "display_price",
      width: 130,
      render: (v) =>
        v != null ? (
          <span
            style={{ color: v === 0 ? "red" : "green", fontWeight: "bold" }}
          >
            {v.toLocaleString("vi-VN")} đ
          </span>
        ) : (
          ""
        ),
    },
    {
      title: "Trọng lượng",
      dataIndex: "weight",
      key: "weight",
      width: 120,
      render: (v) => {
        if (!v) return "—";
        return v < 1000
          ? `${v.toLocaleString("vi-VN")} g`
          : `${(v / 1000).toLocaleString("vi-VN")} kg`;
      },
    },
    {
      title: "Tồn kho (đôi)",
      dataIndex: "total_stock",
      key: "total_stock",
      width: 150,
    },
    {
      title: "Thời gian sale",
      key: "sale_time",
      width: 200,
      render: (_, record) => {
        const start = record.sale_start;
        const end   = record.sale_end;
        const dp    = record.display_price;
        if (!dp) return <Tag color="default">Không sale</Tag>;
        const now = dayjs();
        const startDj = start ? dayjs(start) : null;
        const endDj   = end   ? dayjs(end)   : null;
        // Xác định trạng thái
        if (endDj && now.isAfter(endDj)) {
          return <Tag color="red">Đã kết thúc</Tag>;
        }
        if (startDj && now.isBefore(startDj)) {
          return (
            <Tooltip title={`Bắt đầu: ${startDj.format("DD/MM/YYYY HH:mm")}`}>
              <Tag color="orange">Sắp diễn ra</Tag>
            </Tooltip>
          );
        }
        // Đang sale
        return (
          <Tooltip title={
            [start && `Từ: ${dayjs(start).format("DD/MM/YYYY HH:mm")}`,
             end   && `Đến: ${dayjs(end).format("DD/MM/YYYY HH:mm")}`]
            .filter(Boolean).join(" | ") || "Vĩnh viễn"
          }>
            <Tag color="green">
              {endDj ? `Còn ${endDj.diff(now, "hour")}h` : "Đang sale"}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 150,
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Hoạt động" : "Ngừng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <ViewProduct record={record} />
          <EditProduct record={record} onReload={handleReload} />
          <DeleteProduct
            record={record}
            onReload={handleReload}
            statusFilter={statusFilter}
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Quản lý sản phẩm</h2>
      </div>

      <div className="action-bar">
        <div className="action-bar__left">
          <CreateProduct onReload={handleReload} />
          <ImportProduct onReload={handleReload} />
        </div>
        <div className="action-bar__right">
          <Select
            value={statusFilter}
            style={{ width: 160 }}
            onChange={(value) => {
              setStatusFilter(value);
              setPagination((p) => ({ ...p, current: 1 }));
              fetchApi(keyword, 1, pagination.pageSize, value);
            }}
            options={[
              { label: "Hoạt động", value: "ĐANG_HOAT_DONG" },
              { label: "Ngừng hoạt động", value: "NGUNG_HOAT_DONG" },
            ]}
          />
          <Search
            placeholder="Tìm theo tên sản phẩm..."
            allowClear
            enterButton="Search"
            style={{ width: 260 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch("")}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => {
            setPagination((p) => ({ ...p, current: page, pageSize }));
            fetchApi(keyword, page, pageSize, statusFilter);
          },
        }}
        scroll={{ x: 1800 }}
      />
    </>
  );
}

export default ProductManagement;
