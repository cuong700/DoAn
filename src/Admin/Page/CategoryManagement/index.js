import { message, Space, Table, Input, Tag, Select } from "antd";
import { useEffect, useState } from "react";
import "./CategoryManagement.css";
import CreateCategory from "./CreateCategory";
import EditCategory from "./EditCategory";
import DeleteCategory from "./DeleteCategory";
import { getCookie } from "../../../helpers/cookie";

const { Search } = Input;

function CategoryManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("ĐANG_HOAT_DONG");

  const fetchApi = async (
    searchText = "",
    current = 1,
    pageSize = 10,
    active = "ĐANG_HOAT_DONG"
  ) => {
    try {
      setLoading(true);

      const token = getCookie("token");

      const params = new URLSearchParams({
        keyword: searchText,
        page: String(current - 1),
        limit: String(pageSize),
      });

      if (active === "ĐANG_HOAT_DONG") {
        params.append("active", "true");
      } else if (active === "NGUNG_HOAT_DONG") {
        params.append("active", "false");
      }

      const res = await fetch(
        `http://localhost:8090/api/v1/categories/public/search?${params.toString()}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được danh sách danh mục"); // Kiểm tra xem API trả về dữ liệu hợp lệ hay không

      const json = await res.json();
      let categories = json?.data?.content || [];


      categories = categories.sort((a, b) => b.id - a.id);

      setDataSource(categories);

      // Cập nhật lại thông tin phân trang từ backend
      const total = json?.data?.total_elements;

      setPagination((prev) => ({
        ...prev,
        current, //ghi đè lại 3 trường này
        pageSize,
        total,
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi("", pagination.current, pagination.pageSize, activeFilter);
  }, []);

  const handleReload = () => {
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    fetchApi(keyword, 1, newPagination.pageSize, activeFilter);
  };

  const handleSearch = async (value) => {
    const trimmed = value.trim(); //Xóa khoảng trắng đầu/cuối
    setKeyword(trimmed);
    // reset về trang 1 khi search
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    await fetchApi(trimmed, 1, newPagination.pageSize, activeFilter);
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => {
        const page = pagination.current; // trang hiện tại
        const pageSize = pagination.pageSize; //số dòng mỗi trang
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active) =>
        active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng hoạt động</Tag>
        ),
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      render: (_, record) => {
        return (
          <>
            <Space>
              <EditCategory record={record} onReload={handleReload} />

              <DeleteCategory
                record={record}
                onReload={handleReload}
                activeFilter={activeFilter}
              />
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>
      <h2 className="category-management__title">Quản lý danh mục</h2>

      <div className="category-management__header">
        <div className="category-management__left">
          <CreateCategory onReload={handleReload} />
        </div>

        <div className="category-management__right">
          <Select
            value={activeFilter}
            style={{ width: 160 }}
            onChange={(value) => {
              setActiveFilter(value);
              const newPagination = { ...pagination, current: 1 };
              setPagination(newPagination);
              fetchApi(keyword, 1, newPagination.pageSize, value);
            }}
            options={[
              { label: "Hoạt động ", value: "ĐANG_HOAT_DONG" },
              { label: "Ngừng hoạt động", value: "NGUNG_HOAT_DONG" },
            ]}
          />

          <Search
            placeholder="Tìm theo tên danh mục ..."
            allowClear
            enterButton="Search"
            style={{ width: 260 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch("")}
          />
        </div>
      </div>

      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={(newPagination) => {
          setPagination(newPagination);
          fetchApi(
            keyword,
            newPagination.current,
            newPagination.pageSize,
            activeFilter
          );
        }}
      />
    </>
  );
}

export default CategoryManagement;
