import {
  message,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Input,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import ViewInvoice from "./ViewInvoice";
import { getCookie } from "../../../helpers/cookie";
import "./InvoiceManagement.css";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import SendOutInvoice from "./SendOutInvoice";
import CheckOutInvoice from "./CheckOutInvoice";
import CloseOutInvoice from "./CloseOutInvoice";
import EditInvoice from "./EditInvoice";

const { Search } = Input;

function OrderManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });
  const [spinning, setSpinning] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchApi = async (
    searchText = "",
    current = 1,
    pageSize = 8,
    status = "ALL"
  ) => {
    try {
      setSpinning(true);

      const params = new URLSearchParams({
        keyword: searchText,
        page: String(current - 1),
        limit: String(pageSize),
      });

      if (status && status !== "ALL") {
        params.append("status", status);
      }

      const token = getCookie("token");

      const res = await fetch(
        `http://localhost:8090/api/v1/orders/admin/get-all-orders?${params.toString()}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được danh sách đơn hàng");

      const json = await res.json();

      const mapped = (json.data || []).map((item) => ({
        ...item,
        key: item.id,
      }));
      setDataSource(mapped);
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total: json?.total_elements,
      }));
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải danh sách đơn hàng!");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchApi("", pagination.current, pagination.pageSize, statusFilter);
  }, []);

  const handleReload = () => {
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    fetchApi(keyword, 1, newPagination.pageSize, statusFilter);
  };

  const handleSearch = async (value) => {
    const trimmed = value.trim(); //Xóa khoảng trắng đầu/cuối
    setKeyword(trimmed);
    // reset về trang 1 khi search
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    await fetchApi(trimmed, 1, newPagination.pageSize, statusFilter);
  };

  const statusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="gold">Chờ xử lý</Tag>;
      case "PROCESSING":
        return <Tag color="blue">Đã lên đơn</Tag>;
      case "SHIPPED":
        return <Tag color="cyan">Đang giao hàng</Tag>;
      case "COMPLETED":
        return <Tag color="green">Hoàn thành</Tag>;
      case "CANCELLED":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">Không rõ</Tag>;
    }
  };
  const columns = [
    {
      title: "STT",
      fixed: "left",
      width: 70,
      render: (_, __, index) => {
        const page = pagination.current;
        const pageSize = pagination.pageSize;
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 90,
      fixed: "left",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "fullname",
      key: "fullname",
      width: 180,
      fixed: "left",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
      width: 130,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 260,
      render: (text) => (
        <Tooltip title={text}>
          <span>
            {text && text.length > 40 ? text.slice(0, 40) + "..." : text || "—"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "order_date",
      key: "order_date",
      width: 120,
      render: (dob) => (dob ? dayjs(dob).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "total_money",
      key: "total_money",
      width: 140,
      render: (value) => {
        const num = Number(value || 0);
        return num.toLocaleString("vi-VN") + " đ";
      },
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 120,
      render: (value) => value || "—",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => statusTag(status),
    },


    {
      title: "Thao tác nhanh",
      key: "action",
      fixed: "right",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space>
          <EditInvoice onReload={handleReload} record={record}/>

          <ViewInvoice record={record} />
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <>
      <h2 className="order-management__title">Quản lý đơn hàng</h2>

      <div className="order-management__header">
        <div className="order-management__left">
          <Space>
            <SendOutInvoice
              selectedRowKeys={selectedRowKeys}
              dataSource={dataSource}
              onReload={handleReload}
            />

            <CheckOutInvoice
              selectedRowKeys={selectedRowKeys}
              dataSource={dataSource}
              onReload={handleReload}
            />

            <CloseOutInvoice
              selectedRowKeys={selectedRowKeys}
              dataSource={dataSource}
              onReload={handleReload}
            />
          </Space>
        </div>

        <div className="order-management__right">
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
              { label: "Tất cả", value: "ALL" },
              { label: "Chờ xử lý", value: "PENDING" },
              { label: "Đã lên đơn", value: "PROCESSING" },
              { label: "Đang giao hàng", value: "SHIPPED" },
              { label: "Hoàn thành", value: "COMPLETED" },
              { label: "Đã huỷ", value: "CANCELLED" },
            ]}
          />

          <Search
            placeholder="Tìm theo mã đơn ..."
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
        spinning={spinning}
        pagination={pagination}
        rowKey="id"
        scroll={{ x: 1500 }}
        rowSelection={rowSelection}
        onChange={(newPagination) => {
          setPagination(newPagination);
          fetchApi(
            keyword,
            newPagination.current,
            newPagination.pageSize,
            statusFilter
          );
        }}
      />
    </>
  );
}

export default OrderManagement;
