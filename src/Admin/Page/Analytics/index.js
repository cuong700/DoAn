import { Line } from "@ant-design/plots";
import { Card, Col, message, Row, Spin, Statistic, Table, Form, DatePicker, Space, Button } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getCookie } from "../../../helpers/cookie";
import "./Analytics.css";
import ExcelAnalytics from "./ExcelAnalytics";
import API_BASE_URL from '../../../config/api';

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

  // State cho bộ lọc ngày tháng
  const [dateFilter, setDateFilter] = useState({
    start: null,
    end: null,
  });

  const [form] = Form.useForm();

  const fetchApi = async (
    current = 1,
    pageSize = 10,
    startMonth = null,
    endMonth = null
  ) => {
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

      // Thêm params start và end nếu có
      if (startMonth) {
        params.append("start", startMonth);
      }
      if (endMonth) {
        params.append("end", endMonth);
      }

      const [resNumber, resChart] = await Promise.all([
        fetch(
          `${API_BASE_URL}/api/v1/orders/admin/revenue/products?${params.toString()}`,
          {
            method: "GET",
            headers,
          }
        ),
        fetch(`${API_BASE_URL}/api/v1/orders/admin/revenue/chart`, {
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

      const productData = (dataNumber.products?.content || []).map((item) => ({
        key: item.productId,
        productId: item.productId,
        productName: item.productName,
        thumbnail: item.thumbnail,
        totalRevenue: Number(item.totalRevenue || 0),
        totalQuantitySold: Number(item.totalQuantitySold || 0),
        totalCost: Number(item.totalCost || 0),
        totalProfit: Number(item.totalProfit || 0),
      }));

      setDataSource(productData);

      // Cập nhật thông tin phân trang từ backend
      const total = dataNumber.products?.totalElements || 0;
      setPagination((prev) => ({
        ...prev,
        current,
        pageSize,
        total,
      }));

      const chartData = Array.isArray(dataChart) ? dataChart : [];

      const sortedData = chartData.sort((a, b) => a.month - b.month);

      const revenueData = sortedData.map((item) => ({
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

  // Xử lý khi submit form tìm kiếm
  const handleSearch = (values) => {
    const { startMonth, endMonth } = values;

    let start = null;
    let end = null;

    if (startMonth) {
      start = dayjs(startMonth).format("MM/YYYY");
    }
    if (endMonth) {
      end = dayjs(endMonth).format("MM/YYYY");
    }

    // Validate: start phải trước end
    if (startMonth && endMonth && dayjs(startMonth).isAfter(dayjs(endMonth))) {
      message.error("Tháng bắt đầu phải trước tháng kết thúc!");
      return;
    }

    setDateFilter({ start, end });
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchApi(1, pagination.pageSize, start, end);
  };

  // Xử lý reset bộ lọc
  const handleReset = () => {
    form.resetFields();
    setDateFilter({ start: null, end: null });
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchApi(1, pagination.pageSize, null, null);
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {record.thumbnail && (
            <img
              src={`${API_BASE_URL}${record.thumbnail}`}
              alt={record.productName}
              crossOrigin="anonymous"
              alt={record.productName}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                borderRadius: "4px",
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
      render: (value) => <strong>{value}</strong>,
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
            <ExcelAnalytics
              startMonth={dateFilter.start}
              endMonth={dateFilter.end}
            />
          </div>
        </div>
   

      {/* Bộ lọc ngày tháng */}
      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
        >
          <Form.Item
            name="startMonth"
            label="Từ tháng"
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              picker="month"
              format="MM/YYYY"
              placeholder="Chọn tháng"
              style={{ width: 180 }}
            />
          </Form.Item>

          <Form.Item
            name="endMonth"
            label="Đến tháng"
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              picker="month"
              format="MM/YYYY"
              placeholder="Chọn tháng"
              style={{ width: 180 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tìm kiếm
              </Button>
              <Button onClick={handleReset}>Đặt lại</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={summary.totalRevenue}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              formatter={(value) =>
                Number(value).toLocaleString("vi-VN") + " đ"
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số lượng bán"
              value={summary.totalQuantitySold}
              precision={0}
              valueStyle={{ color: "#090909ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng chi phí"
              value={summary.totalCost}
              precision={0}
              valueStyle={{ color: "#ff4d4f" }}
              formatter={(value) =>
                Number(value).toLocaleString("vi-VN") + " đ"
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng lợi nhuận"
              value={summary.totalProfit}
              precision={0}
              valueStyle={{ color: "#52c41a" }}
              formatter={(value) =>
                Number(value).toLocaleString("vi-VN") + " đ"
              }
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <h3>Biểu đồ lợi nhuận theo tháng</h3>
        {monthlyRevenue.length > 0 ? (
          <Line {...config} />
        ) : (
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#999" }}
          >
            Chưa có dữ liệu biểu đồ
          </div>
        )}
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          pagination={{
            ...pagination,
            showTotal: (total) => `Tổng ${total} sản phẩm`,
          }}
          onChange={(newPagination) => {
            setPagination(newPagination);
            fetchApi(
              newPagination.current,
              newPagination.pageSize,
              dateFilter.start,
              dateFilter.end
            );
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </>
  );
}

export default Analytics;
