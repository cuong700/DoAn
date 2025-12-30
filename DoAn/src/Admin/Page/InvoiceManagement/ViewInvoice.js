import { EyeOutlined } from "@ant-design/icons";
import { Button, Descriptions, Modal, Table, Tag } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { API_BASE_URL } from "../../Config/constants";
import { getCookie } from "../../../helpers/cookie";

function ViewInvoice(props) {
  const { record } = props;
  const [showModal, setShowModal] = useState(false);

  const [orderDetail, setOrderDetail] = useState(null);

  const handleShowModal = async () => {
    setShowModal(true);

    const token = getCookie("token");
    const res = await fetch(
      `http://localhost:8090/api/v1/orders/user/${record.user_id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const json = await res.json();

    // Lấy đúng đơn theo ID
    const order = json.data.find((item) => item.id === record.id);
    setOrderDetail(order);
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Ảnh",
      dataIndex: "product_thumbnail",
      key: "product_thumbnail",
      render: (thumb) => {
        const url = thumb ? API_BASE_URL + thumb : null;
        return (
          <>
            {url ? (
              <img
                crossOrigin="anonymous"
                src={url}
                alt="thumb"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 4,
                }}
              />
            ) : (
              "—"
            )}
          </>
        );
      },
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (value) => Number(value || 0).toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Số lượng",
      dataIndex: "number_of_products",
      key: "number_of_products",
    },
    {
      title: "Size",
      dataIndex: "size_name",
      key: "size_name",
      width: 100,
    },
    {
      title: "Tạm tính",
      dataIndex: "raw_total",
      key: "raw_total",
      render: (value) => Number(value || 0).toLocaleString("vi-VN") + " đ",
    },
    {
      title: "Mã giảm giá",
      dataIndex: "coupon_code",
      key: "coupon_code",
      render: (value) => value || "—",
    },
    {
      title: "Giảm",
      dataIndex: "coupon_discount",
      key: "coupon_discount",
      render: (value) =>
        value ? Number(value || 0).toLocaleString("vi-VN") + " đ" : "0 đ",
    },
    {
      title: "Thành tiền",
      dataIndex: "total_money",
      key: "total_money",
      render: (value) => Number(value || 0).toLocaleString("vi-VN") + " đ",
    },
  ];

  return (
    <>
      <Button
        size="small"
        type="text"
        style={{ color: "black" }}
        icon={<EyeOutlined />}
        onClick={handleShowModal}
      />

      <Modal
        title={`Chi tiết đơn hàng #${record.id}`}
        open={showModal}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        <Descriptions
          bordered
          size="small"
          column={2}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="Mã đơn">{record.id}</Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            {record.status === "CANCELLED" ? (
              <Tag color="red">Đã huỷ</Tag>
            ) : record.status === "PENDING" ? (
              <Tag color="gold">Chờ xử lý</Tag>
            ) : record.status === "COMPLETED" ? (
              <Tag color="green">Hoàn thành</Tag>
            ) : record.status === "PROCESSING" ? (
              <Tag color="blue">Đã lên đơn</Tag>
            ) : (
              <Tag color="cyan">Đang giao hàng</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Khách hàng">
            {record.fullname}
          </Descriptions.Item>

          <Descriptions.Item label="Số điện thoại">
            {record.phone_number}
          </Descriptions.Item>

          <Descriptions.Item label="Email">{record.email}</Descriptions.Item>

          <Descriptions.Item label="Ngày đặt">
            {record.order_date
              ? dayjs(record.order_date).format("DD/MM/YYYY")
              : "—"}
          </Descriptions.Item>

          <Descriptions.Item label="Địa chỉ" span={2}>
            {record.address}
          </Descriptions.Item>

          <Descriptions.Item label="Phương thức thanh toán">
            {record.payment_method}
          </Descriptions.Item>

          {record.note && (
            <Descriptions.Item label="Ghi chú" >
              {record.note}
            </Descriptions.Item>
          )}

            {record.cancellation_reason && (
            <Descriptions.Item label="Lý do từ chối đơn" >
              {record.cancellation_reason}
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Tổng tiền">
            <b>
              {Number(record.total_money || 0).toLocaleString("vi-VN") + " đ"}
            </b>
          </Descriptions.Item>
        </Descriptions>

        <h4>Danh sách sản phẩm</h4>
        <Table
          dataSource={(orderDetail?.order_details || []).map((item) => ({
            ...item,
            key: item.id,
          }))}
          columns={columns}
          pagination={false}
          size="small"
        />
      </Modal>
    </>
  );
}

export default ViewInvoice;
