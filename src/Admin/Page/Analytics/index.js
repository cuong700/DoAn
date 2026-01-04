import { Line } from "@ant-design/plots";
import { Card, Col, message, Row, Spin, Statistic, Table } from "antd";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import "./Analytics.css";
import ExcelAnalytics from "./ExcelAnalytics";

function Analytics() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalQuantitySold: 0,
    totalCost: 0,
    totalProfit: 0,
  });

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchApi = async (current = 1, pageSize = 10) => {
    try {
      setLoading(true);

      const token = getCookie("token");
      const headers = {
        Authorization: token ? `Bearer ${token}` : undefined,
      };

      const params = new URLSearchParams({
        page: String(current - 1),
        limit: String(pageSize),
      });

      const [resNumber, resChart] = await Promise.all([
        fetch(`http://localhost:8090/api/v1/orders/admin/revenue/products?${params.toString()}`, {
          method: "GET",
          headers,
        }),
        fetch("http://localhost:8090/api/v1/orders/admin/revenue/chart", {
          method: "GET",
          headers,
        }),
      ]);

      if (!resNumber.ok || !resChart.ok) {
        throw new Error("Không lấy được dữ liệu thống kê");
      }

      const dataNumber = await resNumber.json();
      const dataChart = await resChart.json();

      setSummary({
        totalRevenue: Number(dataNumber.grand_total_revenue || 0),
        totalQuantitySold: Number(dataNumber.grand_total_quantity || 0),
        totalCost: Number(dataNumber.grand_total_cost || 0),
        totalProfit: Number(dataNumber.grand_total_profit || 0),
      });

      const productData = (dataNumber.products?.content || []).map(
        (item) => ({
          key: item.productId,
          productId: item.productId,
          productName: item.productName,
          thumbnail: item.thumbnail,
          totalRevenue: Number(item.totalRevenue || 0),
          totalQuantitySold: Number(item.totalQuantitySold || 0),
          totalCost: Number(item.totalCost || 0),
          totalProfit: Number(item.totalProfit || 0),
        })
      );
      setDataSource(productData);

      // Cập nhật thông tin phân trang từ backend
      const total = dataNumber.products?.totalElements || 0;
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total,
      }));

      // Xử lý chart data
      const chartData = Array.isArray(dataChart) ? dataChart : [];
      const revenueData = chartData.map((item) => ({
        month: `Tháng ${item.month}`,
        profit: Number(item.profit || 0),
      }));
      setMonthlyRevenue(revenueData);
    } catch (error) {
      console.error(error);
      message.error("Lỗi tải dữ liệu thống kê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi(pagination.current, pagination.pageSize);
  }, []);

  const config = {
    data: monthlyRevenue,
    xField: "month",
    yField: "profit",
    smooth: true,
    height: 260,
    point: {
      size: 4,
      shape: "circle",
    },
    meta: {
      month: { alias: "Tháng" },
      profit: { alias: "Lợi nhuận (VND)" },
    },
    yAxis: {
      label: {
        formatter: (v) => {
          const num = Number(v);
          if (num >= 1_000_000) {
            return `${(num / 1_000_000).toFixed(1)} tr`;
          }
          return `${(num / 1_000).toFixed(0)} k`;
        },
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Lợi nhuận",
        value: Number(datum.profit).toLocaleString("vi-VN") + " đ",
      }),
    },
  };

  const columns = [
    {
      title: "STT",
      render: (_, __, index) => {
        const page = pagination.current;
        const pageSize = pagination.pageSize;
        return (page - 1) * pageSize + index + 1;
      },
      width: 80,
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      align: "center",
      width: 300,
      render: (_, record) => (
        <div className="analytics-product-cell">
          {record.thumbnail && (
            <img
              src={record.thumbnail}
              alt={record.productName}
              crossOrigin="anonymous"
              className="analytics-product-image"
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: 4,
                marginRight: 12,
              }}
            />
          )}
          <span>{record.productName}</span>
        </div>
      ),
    },
    {
      title: "Số lượng bán",
      dataIndex: "totalQuantitySold",
      key: "totalQuantitySold",
      width: 150,
      render: (value) => <b>{value}</b>,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: (value) => (
        <span style={{ color: "#1890ff" }}>
          {Number(value).toLocaleString("vi-VN") + " đ"}
        </span>
      ),
    },
    {
      title: "Chi phí",
      dataIndex: "totalCost",
      key: "totalCost",
      width: 180,
      render: (value) => (
        <span style={{ color: "#ff4d4f" }}>
          {Number(value).toLocaleString("vi-VN") + " đ"}
        </span>
      ),
    },
    {
      title: "Lợi nhuận",
      dataIndex: "totalProfit",
      key: "totalProfit",
      align: "right",
      width: 180,
      render: (value) => (
        <b style={{ color: "#52c41a" }}>
          {Number(value).toLocaleString("vi-VN") + " đ"}
        </b>
      ),
    },
  ];

  return (
    <>
      <h2 className="analytics-title">Thống kê doanh thu</h2>
      <div className="analytics-header">
        <div className="analytics__right">
          <ExcelAnalytics />
        </div>
      </div>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} className="analytics-summary-row">
          <Col xxl={6} xl={6} lg={12} md={12} sm={12} xs={24}>
            <Card>
              <Statistic
                className="analytics-stat"
                title="Tổng số lượng bán"
                value={summary.totalQuantitySold}
                valueStyle={{ color: "#090909ff" }}
              />
            </Card>
          </Col>

          <Col xxl={6} xl={6} lg={12} md={12} sm={12} xs={24}>
            <Card>
              <Statistic
                className="analytics-stat"
                title="Tổng doanh thu"
                value={summary.totalRevenue}
                valueStyle={{ color: "#1890ff" }}
                formatter={(value) =>
                  Number(value).toLocaleString("vi-VN") + " đ"
                }
              />
            </Card>
          </Col>

          <Col xxl={6} xl={6} lg={12} md={12} sm={12} xs={24}>
            <Card>
              <Statistic
                className="analytics-stat"
                title="Tổng chi phí"
                value={summary.totalCost}
                valueStyle={{ color: "#ff4d4f" }}
                formatter={(value) =>
                  Number(value).toLocaleString("vi-VN") + " đ"
                }
              />
            </Card>
          </Col>

          <Col xxl={6} xl={6} lg={12} md={12} sm={12} xs={24}>
            <Card>
              <Statistic
                className="analytics-stat"
                title="Tổng lợi nhuận"
                value={summary.totalProfit}
                valueStyle={{ color: "#52c41a" }}
                formatter={(value) =>
                  Number(value).toLocaleString("vi-VN") + " đ"
                }
              />
            </Card>
          </Col>
        </Row>

        <Card
          title="Lợi nhuận theo tháng"
          className="analytics-card"
          style={{ marginTop: 16 }}
        >
          {monthlyRevenue.length > 0 ? (
            <Line {...config} />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 0",
                color: "#999",
              }}
            >
              Chưa có dữ liệu biểu đồ
            </div>
          )}
        </Card>

        <Card
          title="Chi tiết sản phẩm"
          className="analytics-card"
          style={{ marginTop: 16 }}
        >
          <Table
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            rowKey="productId"
            pagination={{
              ...pagination,
              showTotal: (total) => `Tổng ${total} sản phẩm`,
            }}
            onChange={(newPagination) => {
              setPagination(newPagination);
              fetchApi(newPagination.current, newPagination.pageSize);
            }}
            scroll={{ x: 900 }}
          />
        </Card>
      </Spin>
    </>
  );
}

export default Analytics;