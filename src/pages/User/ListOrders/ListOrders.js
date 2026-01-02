import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Col,
  ConfigProvider,
  Tag,
  Button,
  Space,
  Modal,
  Image,
  Input,
  message,
} from "antd";
import { EyeOutlined, CloseCircleOutlined, DollarOutlined } from "@ant-design/icons";
import { getCookie } from "../../../helpers/cookie";
import "./ListOrders.css";
import NoData from "../NoData";
import OrderDetail from "./OrderDetail";

const { TextArea } = Input;

export function ListOrders() {
  const [orders, setOrders] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

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

        setOrders(response.data.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statuses = [
    { key: "pending", title: "ĐANG CHỜ XỬ LÝ" },
    { key: "processing", title: "ĐÃ LÊN ĐƠN" },
    { key: "shipped", title: "ĐANG GIAO HÀNG" },
    { key: "completed", title: "ĐÃ HOÀN THÀNH" },
    { key: "cancelled", title: "ĐÃ HỦY" },
  ];

  const statusToIndex = (status) => {
    if (!status) return 0;
    const s = String(status).toUpperCase();

    if (s === "CANCELLED") return 4;
    if (s === "COMPLETED") return 3;
    if (s === "SHIPPED") return 2;
    if (s === "PROCESSING") return 1;
    if (s === "PENDING") return 0;

    return 0;
  };

  const counts = useMemo(() => {
    const c = new Array(statuses.length).fill(0);
    for (const o of orders) {
      const idx = statusToIndex(o.status);
      if (typeof idx === "number" && idx >= 0 && idx < statuses.length)
        c[idx] += 1;
    }
    return c;
  }, [orders]);

  const filteredOrders = orders.filter(
    (order) => statusToIndex(order.status) === current
  );

  const renderStatusTag = (status) => {
    const idx = statusToIndex(status);
    const colorMap = ["orange", "blue", "gold", "green", "red"];
    return (
      <Tag color={colorMap[idx] || "default"}>
        {statuses[idx]?.title || status}
      </Tag>
    );
  };

  const fetchOrderDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `http://localhost:8090/api/v1/orders/user/detail/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedOrder(response.data.data);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
      Modal.error({
        title: "Lỗi",
        content: "Không thể tải chi tiết đơn hàng. Vui lòng thử lại!",
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason("");
    setCancelModalVisible(true);
  };

  const handleCloseCancelModal = () => {
    setCancelModalVisible(false);
    setOrderToCancel(null);
    setCancelReason("");
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.warning("Vui lòng nhập lý do hủy đơn hàng!");
      return;
    }

    setCancelLoading(true);
    try {
      const token = getCookie("token");
      await axios.put(
        `http://localhost:8090/api/v1/orders/user/cancel/${orderToCancel.id}?reason=${encodeURIComponent(cancelReason.trim())}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      message.success("Hủy đơn hàng thành công!");

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderToCancel.id
            ? {
                ...order,
                status: "CANCELLED",
                cancellation_reason: cancelReason.trim(),
              }
            : order
        )
      );

      handleCloseCancelModal();
    } catch (error) {
      console.error("Error canceling order:", error);
      message.error(
        error.response?.data?.message ||
          "Không thể hủy đơn hàng. Vui lòng thử lại!"
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRepay = async (orderId) => {
    try {
      const token = getCookie("token");

      message.loading({ content: "Đang tạo link thanh toán...", key: "repay" });

      const response = await axios.post(
        `http://localhost:8090/api/v1/payment/user/create/${orderId}?gateway=momo`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const resultData = response.data?.data;

      if (resultData && resultData.payUrl) {
        message.success({ content: "Đang chuyển hướng...", key: "repay" });
        window.location.href = resultData.payUrl;
      } else {
        message.error({ content: "Không thể lấy link thanh toán!", key: "repay" });
      }
    } catch (error) {
      console.error("Repay error:", error);
      message.error({ content: "Lỗi kết nối đến cổng thanh toán!", key: "repay" });
    }
  };
  const canCancelOrder = (order) => {
    return statusToIndex(order.status) === 0;
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
          <NoData />
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
                <h4 style={{ margin: "10px" }}>Order ID: #{order.id}</h4>
                <Space>
                  {renderStatusTag(order.status)}

                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => fetchOrderDetail(order.id)}
                    loading={detailLoading}
                  >
                    Xem chi tiết
                  </Button>

                  {String(order.payment_method).toUpperCase() === "MOMO" && statusToIndex(order.status) === 0 && (
                     <Button
                       icon={<DollarOutlined />}
                       style={{
                         backgroundColor: "#a50064",
                         borderColor: "#a50064",
                         color: "white"
                       }}
                       onClick={() => handleRepay(order.id)}
                     >
                       Thanh toán lại
                     </Button>
                  )}

                  {canCancelOrder(order) && (
                    <Button
                      className="cancel-order-btn"
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleOpenCancelModal(order)}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </Space>
              </div>

              {order.cancellation_reason && (
                <div
                  style={{
                    margin: "10px",
                    padding: "10px",
                    background: "#fff1f0",
                    borderRadius: "4px",
                  }}
                >
                  <strong>Lý do hủy:</strong> {order.cancellation_reason}
                </div>
              )}

              <div className="order-card">
                <div className="order-details">
                  {order.order_details.map((item) => (
                    <Col md={24} lg={24} key={item.id} className="order-item">
                      <div className="detail-item">
                        <div className="image">
                          <div className="anhdemo">
                            <Image
                              className="customimage"
                              src={`http://localhost:8090${item.product_thumbnail}`}
                              alt="product"
                              crossOrigin="anonymous"
                              preview={false}
                            />
                          </div>
                        </div>

                        <div className="info">
                          <h2 className="name">{item.product_name}</h2>

                          <div className="sizequantity">
                            <h6 className="size">Size: {item.size_name}</h6>
                            <h6 className="quantity">
                              Quantity: {item.number_of_products}
                            </h6>
                          </div>
                        </div>

                        <h6 className="price">
                          {item.total_money?.toLocaleString("vi-VN")}đ
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
                      <span>Payment Method:</span>
                      <strong>{order.payment_method}</strong>
                    </h5>

                    <h5>
                      <span>Shipping Address:</span>
                      <strong>{order.shipping_address}</strong>
                    </h5>

                    {order.note && (
                      <h5>
                        <span>Note:</span>
                        <strong>{order.note}</strong>
                      </h5>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </ConfigProvider>

      {/* Modal Chi tiết đơn hàng */}
      <OrderDetail
        visible={modalVisible}
        order={selectedOrder}
        onClose={handleCloseModal}
        renderStatusTag={renderStatusTag}
      />

      {/* Modal Hủy đơn hàng */}
      <Modal
        title="Hủy đơn hàng"
        className="cancel-order-modal"
        open={cancelModalVisible}
        onOk={handleCancelOrder}
        onCancel={handleCloseCancelModal}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        confirmLoading={cancelLoading}
        okButtonProps={{ danger: true }}
      >
        <p className="cancel-warning-text">
          Bạn có chắc chắn muốn hủy đơn hàng{" "}
          <strong>#{orderToCancel?.id}</strong>?
        </p>
        <TextArea
          rows={4}
          placeholder="Nhập lý do hủy đơn hàng..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </>
  );
}