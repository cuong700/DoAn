import API_BASE_URL from '../../../config/api';
import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  notification,
  Select,
  Spin,
  Table,
  Tag,
} from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { getCookie } from "../../../helpers/cookie";
import TextArea from "antd/es/input/TextArea";
import { API_BASE_URL } from "../../Config/constants";

function EditInvoice(props) {
  const { record, onReload } = props;

  const [showModal, setShowModal] = useState(false);

  const [form] = Form.useForm();

  const [notiApi, contextHolder] = notification.useNotification();
  const [spinning, setSpinning] = useState(false);

  const [orderDetail, setOrderDetail] = useState(null);

  const [loading, setLoading] = useState(false);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/user/detail/${record.id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Không lấy được chi tiết đơn hàng");

      const json = await res.json();
      setOrderDetail(json.data);

      // Xử lý order_date nếu là mảng [year, month, day]
      let orderDate = null;
      if (json.data.order_date) {
        if (Array.isArray(json.data.order_date)) {
          // Chuyển mảng [2025, 12, 2] thành "2025-12-02"
          const [year, month, day] = json.data.order_date;
          orderDate = dayjs(
            `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
              2,
              "0"
            )}`
          );
        } else {
          // Nếu là string thì parse bình thường
          orderDate = dayjs(json.data.order_date);
        }
      }
      form.setFieldsValue({
        fullname: json.data.fullname || "",
        phone_number: json.data.phone_number || "",
        email: json.data.email || "",
        address: json.data.address || "",
        note: json.data.note || "",
        payment_method: json.data.payment_method || "",
        order_date: orderDate,
      });
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi tải chi tiết đơn hàng",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = () => {
    setShowModal(true);
    fetchOrderDetail();
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      setSpinning(true);

      const token = getCookie("token");

      const payload = {
        fullname: values.fullname,
        phone_number: values.phone_number,
        email: values.email,
        address: values.address,
        note: values.note || "",
        payment_method_id: values.payment_method === "COD" ? 1 : 2,
      };

      console.log("Payload gửi lên:", JSON.stringify(payload, null, 2));

      const res = await fetch(
        `${API_BASE_URL}/api/v1/orders/admin/update/${record.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseText = await res.text();
      console.log("Response status:", res.status);
      console.log("Response text:", responseText);

      if (!res.ok) {
        throw new Error(`Update thất bại: ${responseText}`);
      }

      const json = JSON.parse(responseText);

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin đơn hàng đã được cập nhật.",
      });

      setOrderDetail(json.data);
      setShowModal(false);
      onReload();
    } catch (error) {
      console.error("Chi tiết lỗi:", error);
      notiApi.error({
        message: "Lỗi cập nhật đơn hàng",
        description: error.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setSpinning(false);
    }
  };

  const statusTag = (status) => {
    switch (status) {
      case "PENDING":
        return <Tag color="gold">Chờ xử lý</Tag>;
      case "CONFIRMED":
        return <Tag color="blue">Đã lên đơn</Tag>;
      case "SHIPPED":
        return <Tag color="cyan">Đang giao hàng</Tag>;
      case "COMPLETED":
        return <Tag color="green">Hoàn thành</Tag>;
      case "CANCELLED":
        return <Tag color="red">Đã hủy</Tag>;
      default:
        return <Tag color="default">Không rõ</Tag>;
    }
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
      {contextHolder}
      <Button
        size="small"
        type="text"
        style={{ color: "#1677ff" }}
        icon={<EditOutlined />}
        onClick={handleShowModal}
      />

      <Modal
        title={`Chi tiết đơn hàng #${record.id}`}
        open={showModal}
        onCancel={handleCancel}
        width={900}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            Lưu thay đổi
          </Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Form.Item
                label="Tên khách hàng"
                name="fullname"
                rules={[
                  { required: true, message: "Vui lòng nhập tên khách hàng!" },
                ]}
              >
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>

              <Form.Item
                label="Số điện thoại"
                name="phone_number"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>

              <Form.Item label="Ngày đặt" name="order_date">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày đặt"
                  disabled
                />
              </Form.Item>
            </div>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <Input placeholder="Nhập địa chỉ chi tiết" />
            </Form.Item>

            <Form.Item
              label="Phương thức thanh toán"
              name="payment_method"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn phương thức thanh toán!",
                },
              ]}
            >
              <Select
                placeholder="Chọn phương thức thanh toán"
                options={[
                  { label: "Thanh toán khi nhận hàng (COD)", value: "COD" },
                  { label: "Thanh toán qua MoMo", value: "MOMO" },
                ]}
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="note">
              <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
          </Form>

          <h4 style={{ marginTop: 24, marginBottom: 12 }}>
            Danh sách sản phẩm
          </h4>
          <Table
            dataSource={(orderDetail?.order_details || []).map((item) => ({
              ...item,
              key: item.id,
            }))}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ x: 1000 }}
          />
        </Spin>
      </Modal>
    </>
  );
}

export default EditInvoice;
