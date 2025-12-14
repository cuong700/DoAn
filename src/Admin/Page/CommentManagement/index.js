import { message, Space, Table } from "antd";
import { useEffect, useState } from "react";
import DeleteComment from "./DeleteComment";

function CommentManagement() {
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [dataSource, setDataSource] = useState(false);

  const fetchApi = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://dummyjson.com/comments");

      if (!res.ok) throw new Error("Không lấy được danh sách bình luận"); // Kiểm tra xem API trả về dữ liệu hợp lệ hay không

      const data = await res.json();

      const mapped = data.comments.map((item, _) => ({
        ...item,
        userFullName: item.user.fullName || "",
      }));

      setDataSource(mapped);
    } catch (error) {
      message.error("Lỗi tải danh sách bình luận!");
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
        const pageSize = pagination.pageSize; //số dòng mỗi trang
        return (page - 1) * pageSize + index + 1;
      },
    },
    {
      title: "Tên khách hàng",
      dataIndex: "user",
      key: "user",
      render: (_, record) =>
        record.userFullName 
    },
    {
      title: "Nội dung bình luận",
      dataIndex: "body",
      key: "body",
    },

    {
      title: "Thao tác nhanh",
      key: "action",
      align: "center",
      render: (_, record) => {
        return (
          <>
            <Space>
              <DeleteComment record={record} onReload={handleReload} />
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
        rowKey="id"
        onChange={(newPagination) => setPagination(newPagination)}
      />
    </>
  );
}

export default CommentManagement;
