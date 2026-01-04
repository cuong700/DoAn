import { message, Select, Space, Table, Tag, Tooltip, Input } from "antd";
import { useEffect, useState } from "react";
import "./CouponManagement.css";
import EditCoupon from "./EditCoupon";
import DeleteCoupon from "./DeleteCoupon";
import CreateCoupon from "./CreateCoupon";
import { getCookie } from "../../../helpers/cookie";
import "./CouponManagement.css";

const { Search } = Input;

function CouponManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [activeFilter, setActiveFilter] = useState("ĐANG_HOAT_DONG");

  const fetchApi = async (
    searchText = "",
    current = 1,
    pageSize = 5,
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
        `http://localhost:8090/api/v1/coupons/admin/get-all?${params.toString()}`,
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (!res.ok) throw new Error("Không lấy được danh sách mã giảm giá");

      const json = await res.json();

      const coupons = json.data || [];
      coupons.sort((a, b) => b.id - a.id);

      setDataSource(coupons);

      const total = json.total_elements || 0;
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total,
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách mã giảm giá!");
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
      width: 100,
      fixed: "left",
      render: (_, __, index) => {
        const page = pagination.current; // trang hiện tại
        const pageSize = pagination.pageSize; //số dòng mỗi trang
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Mã giảm giá",
      width: 120,
      dataIndex: "code",
      key: "code",
      fixed: "left",
    },
    {
      title: "Tên giảm giá",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Sản phẩm áp dụng",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 150,
      render: (_, record) => {
        return (
          <>
            {record.active === true ? (
              <>
                <Tooltip
                  placement="top"
                  title="Coupon vẫn còn hiệu lực"
                  color="green"
                >
                  <Tag color="green">Còn hạn</Tag>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip
                  placement="top"
                  title="Coupon đã hết hạn sử dụng"
                  color="red"
                >
                  <Tag color="red">Hết hạn</Tag>
                </Tooltip>
              </>
            )}
          </>
        );
      },
    },
    {
      title: "Thuộc tính",
      dataIndex: "attribute",
      key: "attribute",
    },
    {
      title: "Dấu",
      dataIndex: "operator",
      key: "operator",
    },
    {
      title: "Giá trị",
      dataIndex: "value",
      key: "value",
    },
    {
      title: "Giảm giá",
      dataIndex: "discount_amount",
      key: "discount_amount",
      render: (value) => {
        if (value < 100) {
          return `${value}%`;
        } else if (value >= 100) {
          return `${value.toLocaleString("vi-VN")}đ`;
        }
        return value;
      },
    },
    {
      title: "Loại giảm",
      dataIndex: "is_percent",
      key: "is_percent",
      render: (_, record) => {
        return (
          <>
            {record.is_percent ? (
              <Tag color="red">Giảm phần trăm</Tag>
            ) : (
              <Tag color="blue">Giảm tiền</Tag>
            )}
          </>
        );
      },
    },
    {
      title: "Áp dụng",
      dataIndex: "apply_to_all",
      key: "apply_to_all",
      render: (_, record) => {
        return (
          <>
            {record.apply_to_all ? (
              <Tag color="green">Áp dụng cho tất cả</Tag>
            ) : (
              <Tag color="purple">Áp dụng có điều kiện</Tag>
            )}
          </>
        );
      },
    },

    {
      title: "Thao tác nhanh",
      dataIndex: "action",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => {
        return (
          <>
            <Space>
              <EditCoupon record={record} onReload={handleReload} />

              <DeleteCoupon
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
      <h2 className="coupon-management__title">Quản lý mã giảm giá</h2>

      <div className="coupon-management__header">
        <div className="coupon-management__left">
          <CreateCoupon onReload={handleReload} />
        </div>

        <div className="coupon-management__right">
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
              { label: "Hoạt động", value: "ĐANG_HOAT_DONG" },
              { label: "Ngừng hoạt động", value: "NGUNG_HOAT_DONG" },
            ]}
          />

          <Search
            placeholder="Tìm theo mã / tên mã giảm giá..."
            allowClear
            enterButton="Search"
            style={{ width: 260 }}
            onSearch={handleSearch}
            onChange={(e) => !e.target.value && handleSearch("")}
          />
        </div>
      </div>
      <Table
        className="custom-table"
        columns={columns}
        dataSource={dataSource}
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
        scroll={{ x: 1800 }}
      />
    </>
  );
}

export default CouponManagement;
