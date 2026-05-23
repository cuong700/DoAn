import { Image, Space, Table, Tag } from "antd";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import { API_BASE_URL } from "../../Config/constants";
import CreateBanner from "./CreateBanner";
import DeleteBanner from "./DeleteBanner";
import EditBanner from "./EditBanner";
import "./BannerManagement.css";

function BannerManagement() {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const buildImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  const fetchApi = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const res = await fetch(
        "http://localhost:8090/api/v1/banners/public/active",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được danh sách banner");

      const json = await res.json();
      const banners = (json?.data || []).sort(
        (a, b) => a.display_order - b.display_order
      );
      setDataSource(banners.map((b) => ({ ...b, key: b.id })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleReload = () => fetchApi();

  const columns = [
    {
      title: "STT",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "image_url",
      key: "image_url",
      width: 150,
      render: (url) => (
        <Image
          src={buildImageUrl(url)}
          alt="banner"
          crossOrigin="anonymous"
          className="banner-preview-img"
          style={{ width: 120, height: 60, objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
    },
    {
      title: "Phụ đề",
      dataIndex: "subtitle",
      key: "subtitle",
      width: 200,
      render: (text) => text || "—",
    },
    {
      title: "Badge",
      dataIndex: "badge",
      key: "badge",
      width: 100,
      render: (text) =>
        text ? <Tag color="blue">{text}</Tag> : "—",
    },
    {
      title: "Sản phẩm",
      dataIndex: "product_id",
      key: "product_id",
      width: 100,
      render: (id) => (id ? `#${id}` : "—"),
    },
    {
      title: "Thứ tự",
      dataIndex: "display_order",
      key: "display_order",
      width: 90,
      align: "center",
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      width: 120,
      render: (active) =>
        active ? (
          <Tag color="green">Hiển thị</Tag>
        ) : (
          <Tag color="red">Ẩn</Tag>
        ),
    },
    {
      title: "Thao tác nhanh",
      key: "action",
      fixed: "right",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space>
          <EditBanner record={record} onReload={handleReload} />
          <DeleteBanner record={record} onReload={handleReload} />
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2 className="banner-management__title">Quản lý Banner</h2>

      <div className="banner-management__header">
        <div className="banner-management__left">
          <CreateBanner onReload={handleReload} />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 1000 }}
      />
    </>
  );
}

export default BannerManagement;
