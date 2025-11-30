import { render } from "@testing-library/react";
import { message, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import "./CouponManagement.css";
import EditCoupon from "./EditCoupon";
import DeleteCoupon from "./DeleteCoupon";
import CreateCoupon from "./CreateCoupon";

function CouponManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const fetchApi = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://dummyjson.com/comments");

      if (!res.ok) throw new Error("Không lấy được danh sách mã giảm giá");

      const data = await res.json();

      const mapped = data.comments.map((item, index) => ({
        ...item,
      }));

      setDataSource(mapped);
    } catch (error) {
      message.error("Lỗi tải danh sách mã giảm giá!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleReload = () => {
    fetchApi();
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
      dataIndex: "body",
      key: "body",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 150,
      render: (_, record) => {
        return (
          <>
            {record.active === "1" ? (
              <>
                <Tag color="green">Đang hoạt động</Tag>
              </>
            ) : (
              <>
                <Tag color="red"> Ngừng hoạt động</Tag>
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
    },
    {
      title: "Loại giảm",
      dataIndex: "is_percent",
      key: "is_percent",
    },
    {
      title: "Áp dụng",
      dataIndex: "apply_to_all",
      key: "apply_to_all",
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

              <DeleteCoupon record={record} onReload={handleReload} />
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="user-toolbar1">
        <CreateCoupon onReload={handleReload} />
      </div>
      
      <Table
        className="custom-table"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        onChange={(newPagination) => setPagination(newPagination)}
        scroll={{ x: 1800 }}
      />
    </>
  );
}

export default CouponManagement;
