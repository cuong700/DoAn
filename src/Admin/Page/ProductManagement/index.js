import { Button, Space, Table, Tooltip } from "antd";
import { useEffect, useState } from "react";
import EditProduct from "./EditProduct";
import DeleteProduct from "./DeleteProduct";
import CreateProduct from "./CreateProduct";
import { FileExcelOutlined } from "@ant-design/icons";
import ViewProduct from "./ViewProduct";

function ProductManagement() {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const [loading, setLoading] = useState(false);

  const [dataSource, setDataSource] = useState(false);

  const fetchApi = async () => {
    try {
      setLoading(true);

      const res = await fetch("https://dummyjson.com/products");

      if (!res.ok) throw new Error("Không lấy được danh sách sản phẩm");

      const data = await res.json();

      const mapped = data.products.map((item, _) => ({
        ...item,
      }));
      setDataSource(mapped);
    } catch (error) {
      console.error("Lỗi tải danh sách sản phẩm!");
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
      title: "Ảnh sản phẩm",
      dataIndex: "thumbnail",
      key: "thumbnail",
      render: (url) => (
        <img
          src={url}
          alt="product"
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
      title: "Tên sản phẩm",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Giá tiền",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
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
      title: "Thao tác nhanh",
      key: "action",
      render: (_, record) => {
        return (
          <>
            <Space>
              <ViewProduct record={record} />

              <EditProduct record={record} onReload={handleReload} />

              <DeleteProduct record={record} onReload={handleReload} />
            </Space>
          </>
        );
      },
    },
  ];

  return (
    <>
      <div className="user-toolbar1">
        <CreateProduct onReload={handleReload} />

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
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        onChange={(newPagination) => setPagination(newPagination)}
      />
    </>
  );
}

export default ProductManagement;
