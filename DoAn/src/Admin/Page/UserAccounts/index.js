import {
  message,
  Space,
  Table,
  Tag,
  Tooltip,
  Input,
  Select,
  Switch,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DeleteUser from "./DeleteUser";
import ViewUser from "./ViewUser";
import EditUser from "./EditUser";

import "./UserAccounts.css";
import { getCookie } from "../../../helpers/cookie";

const { Search } = Input;

function UserAccounts() {
  const [dataSource, setDataSource] = useState([]);

  const [loading, setLoading] = useState(false);

  const [modal, contextHolder] = Modal.useModal();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ĐANG_HOAT_DONG");

  const fetchApi = async (
    searchText = "",
    current = 1,
    pageSize = 10,
    status = "ĐANG_HOAT_DONG"
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
        `http://localhost:8090/api/v1/users/admin/get-all-user?${params.toString()}`,

        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Không lấy được danh sách user");

      const json = await res.json();

      const users = json?.data || [];

      setDataSource(users);

      // Cập nhật lại thông tin phân trang từ backend
      const total = json?.data?.total_elements ;

      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total,
      }));
    } catch (error) {
      message.error("Lỗi tải danh sách người dùng!");
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
    const trimmed = value.trim(); //Xóa khoảng trắng đầu/cuối
    setKeyword(trimmed);
    // reset về trang 1 khi search
    const newPagination = { ...pagination, current: 1 };
    setPagination(newPagination);
    fetchApi(trimmed, 1, newPagination.pageSize, statusFilter);
  };

  const handleToggleStatus = async (record, checked) => {
    // lưu lại trạng thái cũ để rollback nếu lỗi
    const oldStatus = record.is_active;

    //cập nhật UI ngay lập tức
    setDataSource((prev) =>
      prev.map((item) =>
        item.id === record.id ? { ...item, is_active: checked } : item
      )
    );

    try {
      const token = getCookie("token");

      const statusValue = checked ? 1 : 0; 

      const res = await fetch(
        `http://localhost:8090/api/v1/users/admin/block/${record.id}/${statusValue}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");

      message.success(checked ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản");

      fetchApi(keyword, pagination.current, pagination.pageSize, statusFilter);
    } catch (error) {
      // nếu lỗi → rollback về trạng thái cũ
      setDataSource((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, is_active: oldStatus } : item
        )
      );
      message.error("Không thể cập nhật trạng thái!");
    }
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => {
        const page = pagination.current; // trang hiện tại
        const pageSize = pagination.pageSize; //số dong mỗi trang
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
    },
    {
      title: "Ngày sinh",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      render: (dob) => (dob ? dayjs(dob).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },

    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        return role?.name === "ADMIN" ? (
          <Tag color="red">ADMIN</Tag>
        ) : (
          <Tag color="blue">USER</Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "is_active",
      key: "is_active",
      render: (_, record) => {
        const checked = record.is_active === true;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch
              size="small"
              checked={checked}
              
              onChange={(value) => {
                modal.confirm({
                  title: value ? "Kích hoạt tài khoản?" : "Khóa tài khoản?",
                  content: value
                    ? "Bạn có chắc muốn kích hoạt tài khoản này không?"
                    : "Bạn có chắc muốn khóa tài khoản này không?",
                  okText: "Xác nhận",
                  cancelText: "Hủy",
                  okType: value ? "primary" : "danger",
                  onOk: () => handleToggleStatus(record, value),
                });
              }}


            />
            <span
              style={{
                fontWeight: 600,
                color: checked ? "#16a34a" : "#ef4444",
              }}
            >
              {checked ? "Active" : "Blocked"}
            </span>
          </div>
        );
      },
    },

    {
      title: "Thao tác nhanh",
      key: "actions",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Space>
              <ViewUser record={record} />
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <h2 className="user-accounts__title">Quản lý khách hàng</h2>

      <div className="user-accounts__header">
        <div className="user-accounts__right">
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
            placeholder="Tìm theo tên / SĐT ..."
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
        pagination={pagination}
        rowKey="id" // giúp Table nhận đúng id
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

export default UserAccounts;
