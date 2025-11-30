import { Line } from "@ant-design/plots";
import { Card, Col, message, Row, Spin, Statistic, Table } from "antd";
import { useEffect, useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import "./Analytics.css";
import ExcelAnalytics from "./ExcelAnalytics";

function Analytics() {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalSold: 0,
  });

  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    const fetchApi = async () => {
      try {
        setLoading(true);

        const token = getCookie("token");
        const headers = {
          Authorization: token ? `Bearer ${token}` : undefined,
        };

        const [resNumber, resChart] = await Promise.all([
          fetch("http://localhost:8090/api/v1/statistics/dashboard", {
            method: "GET",
            headers,
          }),
          fetch("http://localhost:8090/api/v1/orders/revenue/chart", {
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
          totalRevenue: Number(dataNumber.totalRevenue || 0),
          totalSold: Number(dataChart.totalSold || 0),
        });

        const productData = (dataNumber.products || []).map((item, index) => ({
          key: item.id || index,
          name: item.name,
          revenue: Number(item.revenue || 0),
          quantity: Number(item.quantity || 0),
          image: item.imageUrl,
        }));
        setDataSource(productData);

        //Xem xét lại
        const rawChartData = Array.isArray(dataChart.data)
          ? dataChart.data
          : Array.isArray(dataChart)
          ? dataChart
          : [];

        const revenueData = rawChartData.map((item) => ({
          month: String(item.month),
          revenue: Number(item.revenue || item.totalRevenue || 0),
        }));
        setMonthlyRevenue(revenueData);
      } catch (error) {
        console.error(error);
        message.error("Lỗi tải dữ liệu thống kê!");
      } finally {
        setLoading(false);
      }
    };
    fetchApi();
  }, []);

  const config = {
    data: monthlyRevenue,
    xField: "month",
    yField: "revenue",
    smooth: true,
    height: 260,
    point: {
      size: 4,
      shape: "circle",
    },
    meta: {
      month: { alias: "Tháng" },
      revenue: { alias: "Doanh thu (VND)" },
    },

    yAxis: {
      label: {
        formatter: (v) => `${Number(v) / 1_000_000} tr`,
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: "Doanh thu",
        value: datum.revenue.toLocaleString("vi-VN") + " đ",
      }),
    },
  };

  const columns = [
    {
      title: "Tên giày",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div className="analytics-product-cell">
          {record.image && (
            <img
              src={record.image}
              alt={record.name}
              className="analytics-product-image"
            />
          )}
          <span>{record.name}</span>
        </div>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (value) =>
        typeof value === "number"
          ? value.toLocaleString("vi-VN") + " đ" //định dạng tiền tệ theo từng vùng
          : "0 đ",
    },
    {
      title: "Số lượng đã bán",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
  ];
  return (
    <>
      <div className="analytics-page">
        <div className="analytics-header">
          <h2 className="analytics-title">Doanh thu</h2>
          <ExcelAnalytics />
        </div>

        <Spin spinning={loading}>
          <Row gutter={[20, 20]} className="analytics-summary-row">
            <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
              <Card>
                <Statistic
                  className="analytics-stat"
                  title="Tổng doanh thu"
                  value={summary.totalRevenue}
                  formatter={(value) =>
                    Number(value).toLocaleString("vi-VN") + " đ"
                  }
                />
              </Card>
            </Col>
            <Col xxl={12} xl={12} lg={12} md={12} sm={24} xs={24}>
              <Card>
                <Statistic
                  className="analytics-stat"
                  title="Tổng số lượng bán"
                  value={summary.totalSold}
                  precision={2}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Doanh thu theo tháng" className="analytics-card">
            <Line {...config} />
          </Card>

          <Card title="Top sản phẩm" className="analytics-card">
            <Table dataSource={dataSource} columns={columns} />
          </Card>
        </Spin>
      </div>
    </>
  );
}

export default Analytics;
