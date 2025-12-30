import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Col, ConfigProvider, Tag, Button, Space } from "antd";
import { getCookie } from "../../../helpers/cookie";
import "./ListOrders.css";
// import NoData from "../../../NoData/index";

export function ListOrders() {
  const [orders, setOrders] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getCookie("token");
        const idUser = getCookie("userid");
        const response = await axios.get(
          `http://localhost:8090/api/v1/orders/user/${idUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrders(response.data.content || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // statuses with "ĐANG GIAO" added
  const statuses = [
    { key: "pending", title: "ĐANG CHỜ XỬ LÝ" },
    { key: "processing", title: "ĐANG XỬ LÝ" },
    { key: "shipping", title: "ĐANG GIAO HÀNG" },
    { key: "completed", title: "ĐÃ HOÀN THÀNH" },
    { key: "cancelled", title: "ĐÃ HỦY" },
  ];

  // map backend progress to index 0..4
  const progressToIndex = (progress) => {
    if (!progress) return 0;
    const p = String(progress).toUpperCase();

    if (p.includes("HUY")) return 4; // ĐÃ HỦY
    if (p.includes("HOAN") || p.includes("THANH") || p.includes("COMPLE"))
      return 3; // ĐÃ HOÀN THÀNH
    if (p.includes("GIAO") || p.includes("SHIPPED") || p.includes("DELIVER"))
      return 2; // ĐANG GIAO HÀNG
    if (
      p.includes("XAC") ||
      p.includes("LEN") ||
      p.includes("PROCESS") ||
      p.includes("PROCESSING") ||
      p.includes("PICKING") ||
      p.includes("PACK")
    )
      return 1; // ĐANG XỬ LÝ

    // default: đang chờ xử lý
    return 0;
  };

  const counts = useMemo(() => {
    const c = new Array(statuses.length).fill(0);
    for (const o of orders) {
      const idx = progressToIndex(o.progress);
      if (typeof idx === "number" && idx >= 0 && idx < statuses.length)
        c[idx] += 1;
    }
    return c;
  }, [orders]);

  const filteredOrders = orders.filter(
    (order) => progressToIndex(order.progress) === current
  );

  const renderStatusTag = (progress) => {
    const idx = progressToIndex(progress);
    const colorMap = ["orange", "blue", "gold", "green", "red"];
    return (
      <Tag color={colorMap[idx] || "default"}>
        {statuses[idx]?.title || progress}
      </Tag>
    );
  };

  return (
    <>
      <div className="order-container">
        <h1 style={{ padding: "5px" }}>Thông tin đơn hàng</h1>
      </div>

      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "black",
            colorPrimaryBorder: "black",
          },
        }}
      >
        <div className="status-buttons" style={{ marginBottom: 16 }}>
          <Space wrap>
            {statuses.map((s, i) => (
              <Button
                key={s.key}
                type={current === i ? "primary" : "default"}
                onClick={() => setCurrent(i)}
              >
                {s.title} ({counts[i] || 0})
              </Button>
            ))}
          </Space>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : filteredOrders.length === 0 ? (
          <></>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="order-wrapper">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: "10px" }}>Order Label: {order.label}</h4>
                {renderStatusTag(order.progress)}
              </div>

              <div className="order-card">
                <div className="order-details">
                  {order.order_details.map((item) => (
                    <Col md={24} lg={24} key={item.id} className="order-item">
                      <div className="detail-item">
                        <div className="image">
                          <div className="anhdemo">
                            <img
                              className="customimage"
                              src={
                                "http://localhost:8090/api/v1/products/images/" +
                                item?.product?.product_images[0]?.image_url
                              }
                              alt="product"
                            />
                          </div>
                        </div>

                        <div className="info">
                          <h2 className="name">{item?.product?.name}</h2>

                          <div className="sizequantity">
                            <h6 className="size">Color: {item?.color}</h6>
                            <h6 className="quantity">
                              Quantity: {item?.quantity}
                            </h6>
                          </div>
                        </div>

                        <h6 className="price">
                          {(item?.price * item?.quantity).toLocaleString(
                            "vi-VN"
                          )}
                          đ
                        </h6>
                      </div>
                    </Col>
                  ))}
                  <div className="order-info">
                    <h5>
                      <span>Total Money:</span>
                      <strong>
                        {order.total_money?.toLocaleString("vi-VN") ?? "N/A"}đ
                      </strong>
                    </h5>

                    <h5>
                      <span>Fee ship:</span>
                      <strong>
                        {order.fee_ship?.toLocaleString("vi-VN") ?? "N/A"}đ
                      </strong>
                    </h5>

                    <h5>
                      <span>Total Payment:</span>
                      <strong className="total-color">
                        {order.total_money != null && order.fee_ship != null
                          ? (order.total_money + order.fee_ship).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                        đ
                      </strong>
                    </h5>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </ConfigProvider>
    </>
  );
}
