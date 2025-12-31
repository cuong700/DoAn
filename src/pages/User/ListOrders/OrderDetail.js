import React from "react";
import { Modal, Button, Descriptions, Image, Divider, Tag, Space } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

function OrderDetail(props) {
  const { visible, order, onClose, renderStatusTag } = props;
  if (!order) return null;

  return (
    <Modal
      title={
        <div style={{ fontSize: 20, fontWeight: 600 }}>
          Chi tiết đơn hàng #{order.id}
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={900}
    >
      {/* Thông tin đơn hàng */}
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Trạng thái" span={2}>
          {renderStatusTag(order.status)}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày đặt hàng">
          {order.order_date
            ? dayjs(order.order_date).format("DD/MM/YYYY")
            : "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày giao hàng">
          {order.shipping_date
            ? dayjs(order.shipping_date).format("DD/MM/YYYY")
            : "—"}
        </Descriptions.Item>

        <Descriptions.Item label="Họ tên">{order.fullname}</Descriptions.Item>

        <Descriptions.Item label="Số điện thoại">
          {order.phone_number}
        </Descriptions.Item>

        <Descriptions.Item label="Email" span={2}>
          {order.email || "Không có"}
        </Descriptions.Item>

        <Descriptions.Item label="Địa chỉ giao hàng" span={2}>
          {order.shipping_address}
        </Descriptions.Item>

        <Descriptions.Item label="Phương thức thanh toán">
          <Tag color="blue">{order.payment_method}</Tag>
        </Descriptions.Item>
        
        {order.note && (
          <Descriptions.Item label="Ghi chú" span={2}>
            {order.note}
          </Descriptions.Item>
        )}

        {order.cancellation_reason && (
          <Descriptions.Item label="Lý do hủy" span={2}>
            <Tag color="red" icon={<CloseCircleOutlined />}>
              {order.cancellation_reason}
            </Tag>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider>Sản phẩm trong đơn hàng</Divider>

      {/* Danh sách sản phẩm */}
      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {order.order_details.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 16,
              padding: 16,
              background: "#fafafa",
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Image
              src={`http://localhost:8090${item.product_thumbnail}`}
              crossOrigin="anonymous"
              preview={false}
              alt={item.product_name}
              width={80}
              height={80}
              style={{ objectFit: "cover", borderRadius: 8 }}
            />

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {item.product_name}
              </div>

              <Space size="large">
                <span>
                  Size: <strong>{item.size_name}</strong>
                </span>
                <span>
                  SL: <strong>{item.number_of_products}</strong>
                </span>
                <span>
                  Đơn giá:{" "}
                  <strong style={{ color: "#e53935" }}>
                    {item.price?.toLocaleString("vi-VN")}đ
                  </strong>
                </span>
              </Space>

              {item.coupon_code && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    alignItems: "flex-start",
                  }}
                >
                  <Tag color="green">
                    Mã giảm giá: {item.coupon_code} (-
                    {item.coupon_discount?.toLocaleString("vi-VN")}đ)
                  </Tag>
                </div>
              )}

              {item.coupons && item.coupons.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    alignItems: "flex-start",
                  }}
                >
                  {item.coupons.map((coupon, couponIdx) => {
                    const isPercentage = coupon.discount < 100;
                    const displayDiscount = isPercentage
                      ? `${coupon.discount}%`
                      : `${coupon.discount?.toLocaleString("vi-VN")}đ`;

                    return (
                      <Tag key={couponIdx} color="green" style={{ margin: 0 }}>
                        Mã giảm giá: {coupon.code} (-{displayDiscount})
                      </Tag>
                    );
                  })}
                </div>
              )}

              {item.sale_price && (
                <div style={{ marginTop: 4 }}>
                  <Tag color="orange">
                    Giá sale: {item.sale_price?.toLocaleString("vi-VN")}đ
                  </Tag>
                </div>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#999", fontSize: 12 }}>Thành tiền</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#e53935",
                }}
              >
                {item.total_money?.toLocaleString("vi-VN")}đ
              </div>
            </div>
          </div>
        ))}
      </div>

      <Divider />

      {/* Tổng tiền */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          fontSize: 18,
        }}
      >
        <strong>Tổng tiền đơn hàng:</strong>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#e53935",
          }}
        >
          {order.total_money?.toLocaleString("vi-VN")}đ
        </span>
      </div>

      {order.coupon_code && (
        <div style={{ textAlign: "right", color: "#52c41a" }}>
          Đã áp dụng mã giảm giá: {order.coupon_code} (-
          {order.coupon_discount < 100
            ? `${order.coupon_discount}%`
            : `${order.coupon_discount?.toLocaleString("vi-VN")}đ`}
          )
        </div>
      )}
    </Modal>
  );
}

export default OrderDetail;
