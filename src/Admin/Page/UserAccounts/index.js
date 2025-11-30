import {  message, Space, Table, Tag, Tooltip } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import DeleteUser from "./DeleteUser";
import ViewUser from "./ViewUser";
import EditUser from "./EditUser";


function UserAccounts() {
  const [dataSource, setDataSource] = useState([]);

  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchApi = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://dummyjson.com/users");
      if (!res.ok) throw new Error("Không lấy được danh sách user");

      const data = await res.json();

      const mapped = data.users.map((item, _) => ({
        ...item,
        Address: item.address.city || "",
      }));
      setDataSource(mapped);
    } catch (error) {
      message.error("Lỗi tải danh sách người dùng!");
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
      render: (_, __, index) => {
        const page = pagination.current; // trang hiện tại
        const pageSize = pagination.pageSize; //số dong mỗi trang
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Họ và tên",
      dataIndex: "firstName", //fullname
      key: "firstName",
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      key: "birthDate", //date_of_birth
      render: (dob) => (dob ? dayjs(dob).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone", //phone_number
      key: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      render:(_,record) => 
        record.Address
      
    },
     {
      title: "Trạng thái",
      dataIndex: "status",
      render: (_,record) => {
        return(
          <>
            {record.is_active === "1" ? (
              <> 
                <Tooltip  
                  placement="top"
                  title="Tài khoản vẫn hoạt động"
                  color="green"
                >
                  <Tag color="green">Hoạt động</Tag>
                </Tooltip>
              </>
            ) : (
              <>
                <Tooltip  
                  placement="top"
                  title="Tài khoản bị khoá"
                  color="red"
                >
                  <Tag color="red">Ngừng hoạt động</Tag>
                </Tooltip>
              </>
            )}
          </>
        )
      }
    },
    {
      title: "Thao tác nhanh",
      key: "actions",
      render: (_, record) => {
        return (
          <>
            <Space>
              <ViewUser record={record} />

              <EditUser record={record} onReload={handleReload} />

              <DeleteUser record={record} onReload={handleReload} />
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>

      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={pagination}
        rowKey="id" // giúp Table nhận đúng id
        onChange={(newPagination) => {
          setPagination(newPagination);
        }}
      />
    </>
  );
}

export default UserAccounts;
