import { Image, Select, Space, Table, Tooltip, Input, Tag } from "antd";
import { useEffect, useState } from "react";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";
import CreateProduct from "./CreateProduct";
import ViewProduct from "./ViewProduct";
import { getCookie } from "../../../helpers/cookie";

import { API_BASE_URL } from "../../Config/constants";
import ImportProduct from "./ImportProduct";

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


  const fetchProductsDetail = async (id) => {
    try {
      const token = getCookie("token");

      const res = await fetch(
        `http://localhost:8090/api/v1/products/public/${id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được chi tiết sản phẩm");

      const json = await res.json();
      return json;
    } catch (error) {
      console.error(`Lỗi lấy chi tiết sản phẩm ID ${id}:`, error);
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

      if (status === "ĐANG_HOAT_DONG") {
        params.append("active", "true");
      } else if (status === "NGUNG_HOAT_DONG") {
        params.append("active", "false");
      }

      const res = await fetch(
        `http://localhost:8090/api/v1/products/public/search?${params.toString()}`,

        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được danh sách sản phẩm");

      const json = await res.json();

      const products = json?.data || [];


      products.sort((a, b) => b.id - a.id);

      const buildImageUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${API_BASE_URL}${path}`;
      };

      // Tải chi tiết cho từng sản phẩm
      const productsWithDetails = await Promise.all(
        products.map(async (product) => {
          try {
            const details = await fetchProductsDetail(product.id);

            return {
              ...product,
              thumbnail: buildImageUrl(product.thumbnail),
              images: (details?.images || []).map((img) => buildImageUrl(img)),
              sizes:
                details?.sizes?.map((s) => ({
                  name: s?.name,
                  total: s?.total,
                })) ?? [],
            };
          } catch (err) {
            console.error(`Lỗi load detail cho product ${product.id}`, err);
            return {
              ...product,
              thumbnail: buildImageUrl(product.thumbnail),
              images: (product.images || []).map((img) => buildImageUrl(img)),
              sizes: product.sizes ?? [],
            };
          }
        })
      );
      setDataSource(productsWithDetails);

      // Cập nhật lại thông tin phân trang từ backend
      const total = json?.total_elements || 0;

      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total,
      }));
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchApi("", pagination.current, pagination.pageSize, statusFilter);
  }, []);



  const handleReload = () => {
    fetchApi(keyword, pagination.current, pagination.pageSize, statusFilter);
  };

  const handleSearch = (value) => {
    const trimmed = value.trim(); // Xóa khoảng trắng đầu/cuối
    setKeyword(trimmed);
    // reset về trang 1 khi search
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    fetchApi(trimmed, 1, newPagination.pageSize, statusFilter);
  };

  const columns = [
    {
      title: "STT",
      fixed: "left",
      width: 60,
      render: (_, __, index) => {
        const page = pagination.current; // trang hiện tại
        const pageSize = pagination.pageSize; //số dong mỗi trang
        return (page - 1) * pageSize + index + 1;
      },
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
          crossOrigin="anonymous" //Load ảnh từ domain khác
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
              {images.map((url, index) => (
                <Image
                  key={index}
                  src={url}
                  alt={`mô tả-${index}`}
                  crossOrigin="anonymous"
                  style={{
                    width: 40,
                    height: 40,
                    objectFit: "cover", //không bị méo
                    borderRadius: 4,
                  }}
                />
              ))}
            </div>
          </Image.PreviewGroup>
        );
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
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

        const shortText = text.length > 50 ? text.slice(0, 50) + "..." : text; // hiển thị 1 phần

        return (
          <Tooltip title={text}>
            <span>{shortText}</span>
          </Tooltip>
        );
      },
    },
    {
      title: "Giá nhập",
      dataIndex: "cost",
      key: "cost",
      width: 130,
      render: (value) =>
        typeof value === "number"
          ? value.toLocaleString("vi-VN") + " đ" //định dạng tiền tệ theo từng vùng
          : "0 đ",
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      key: "price",
      width: 130,
      render: (value) =>
        typeof value === "number"
          ? value.toLocaleString("vi-VN") + " đ"
          : "0 đ",
    },
    {
     title: "Giá sale",
     dataIndex: "display_price",
     key: "display_price",
     width: 130,
     render: (value) => {
       if (value === null || value === undefined) {
           return "";
       }
       return (
           <span style={{ color: value === 0 ? 'red' : 'green', fontWeight: 'bold' }}>
           {value.toLocaleString("vi-VN")} đ
           </span>
       );
    },

    },
    {
      title: "Trọng lượng",
      dataIndex: "weight",
      key: "weight",
      width: 120,
      render: (value) => {
        const weightGrams = value;
        if (weightGrams < 1000) {
          return `${weightGrams.toLocaleString("vi-VN")} g`;
        } else {
          const weightKg = weightGrams / 1000;
          return `${weightKg.toLocaleString("vi-VN")} kg`;
        }
      },
    },
    {
      title: "Size / Số lượng",
      dataIndex: "sizes",
      key: "sizes",
      hidden: true,
      width: 250,
      render: (sizes) => {
        if (!Array.isArray(sizes) || sizes.length === 0) {
          return <span>—</span>;
        }

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sizes.map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 12,
                  background: "#fafafa",
                }}
              >
                <div>
                  Size: <b>{item.name}</b>
                </div>
                <div>
                  SL: <b>{item.total}</b>
                </div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Số lượng tồn kho (đôi)",
      dataIndex: "total_stock",
      key: "total_stock",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 150,
      render: (active) => {
        return (
          <>
            {active ? (
              <>
                <Tag color="green">Hoạt động</Tag>
              </>
            ) : (
              <>
                <Tag color="red">Ngừng hoạt động</Tag>
              </>
            )}
          </>
        );
      },
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      fixed: "right",
      width: 180,
      render: (_, record) => {
        return (
          <>
            <Space>
              <ViewProduct record={record} />

              <EditProduct record={record} onReload={handleReload} />

              <DeleteProduct record={record} onReload={handleReload} statusFilter={statusFilter} />
            </Space>
          </>
        );
      },
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
              const newPagination = { ...pagination, current: 1 };
              setPagination(newPagination);
              fetchApi(keyword, 1, newPagination.pageSize, value);
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
            setPagination({ ...pagination, current: page, pageSize });
            fetchApi(keyword, page, pageSize, statusFilter);
          },
        }}
        scroll={{ x: 1800 }}
      />
    </>
  );
}

export default ProductManagement;
