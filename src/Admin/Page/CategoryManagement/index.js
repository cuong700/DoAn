import { FileExcelOutlined } from "@ant-design/icons";
import { Button, message, Space, Table } from "antd";
import { useEffect, useState } from "react";
import "./CategoryManagement.css";
import CreateCategory from "./CreateCategory";
import EditCategory from "./EditCategory";
import DeleteCategory from "./DeleteCategory";

function CategoryManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const fetchApi = async () => {
    try {
      setLoading(true);

      const res = await fetch("  http://localhost:8090/category");

      if (!res.ok) throw new Error("Không lấy được danh sách danh mục");// Kiểm tra xem API trả về dữ liệu hợp lệ hay không

      const data = await res.json();

      const mapped = data.map((item, _) => ({
        ...item,
      }));

      setDataSource(mapped);
    } catch (error) {
      message.error("Lỗi tải danh sách danh mục!");
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
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tổng số sản phẩm",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      render: (_, record) => {
        return (
          <>
            <Space>
              <EditCategory record={record} onReload={handleReload} />

              <DeleteCategory record={record} onReload={handleReload}/>
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="user-toolbar1">
        <CreateCategory onReload={handleReload} />

        <Button
          type="primary"
          icon={<FileExcelOutlined />}
          className="btn-export-excel1 "
          // onClick={handleExportExcel} // TODO: export Excel
        >
          Xuất Excel
        </Button>
      </div>
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

export default CategoryManagement;
