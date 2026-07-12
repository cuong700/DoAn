import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  notification,
  Select,
  Spin,
} from "antd";
import { useState } from "react";
import { getCookie } from "../../../helpers/cookie";
import API_BASE_URL from '../../../config/api';

const { Option } = Select;

function CreateCoupon(props) {
  const { onReload } = props;
  const [showModal, setShowModal] = useState(false);

  const [spinning, setSpinning] = useState(false);
  const [notiApi, contextHolder] = notification.useNotification();

  const [form] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    form.resetFields();
  };

  const fetchProducts = async (keyword = "") => {
    try {
      setLoadingProducts(true);
      const token = getCookie("token");

      const params = new URLSearchParams({
        keyword: keyword || "",
        page: "0",
        limit: "100",
        active: "true",
      });

      const res = await fetch(
        `${API_BASE_URL}/api/v1/products/public/search?${params.toString()}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        console.error("Không lấy được danh sách sản phẩm (status)", res.status);
        setProducts([]);
        return;
      }
      const json = await res.json();

      const list = (json?.data || []).map((p) => ({
        label: p.name,
        value: p.id,
      }));
      setProducts(list);
    } catch (err) {
      console.error("fetchProducts error:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const discountValidator = (_, value) => {
    if (value == null) return Promise.reject("Bắt buộc!");

    const isPercent = form.getFieldValue("is_percent");

    if (isPercent) {
      if (value >= 100)
        return Promise.reject("Giảm phần trăm phải nhỏ hơn 100%");
    } else {
      if (value < 1000) return Promise.reject("Giảm tiền phải >= 1000 đồng");
    }

    return Promise.resolve();
  };

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);

      const token = getCookie("token");

      if (
        value.apply_to_all === false &&
        (!value.product_id || value.product_id.length === 0)
      ) {
        throw new Error(
          "Khi chọn 'Áp dụng có điều kiện' phải chọn ít nhất 1 sản phẩm."
        );
      }

      const payload = {
        code: value.code,
        name: value.name || value.code,
        active: value.active,
        attribute: value.attribute,
        operator: value.operator,
        value: Number(value.value),
        discount_amount: Number(value.discount_amount),
        is_percent: value.is_percent,
        apply_to_all: value.apply_to_all,
      };

      if (value.apply_to_all === false) {
        if (!value.product_id) {
          throw new Error("Phải chọn 1 sản phẩm khi áp dụng có điều kiện");
        }

        payload.product_id = Number(value.product_id);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/v1/coupons/admin/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Thêm mã giảm giá thất bại");

      notiApi.success({
        message: "Thêm mới thành công",
        description: "Thông tin mã giảm giá đã được thêm mới.",
      });

      setShowModal(false);
      form.resetFields();
      onReload();
    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi thêm mã giảm giá thất bại",
        description: "Vui lòng thử lại sau.",
      });
    } finally {
      setSpinning(false);
    }
  };

  const rules = [
    {
      required: true,
      message: "Bắt buộc!",
    },
  ];

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        className="btn-add1"
        onClick={handleShowModal}
      >
        Thêm mới
      </Button>

      <Modal
        title="Thêm mã giảm giá"
        open={showModal}
        onCancel={handleCancel}
        footer={null}
      >
        <Spin spinning={spinning}>
          <Form layout="vertical" onFinish={handleSubmit} form={form}>
            <Form.Item label="Mã giảm giá" name="code" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Tên giảm giá" name="name" rules={rules}>
              <Input />
            </Form.Item>

            <Form.Item label="Trạng thái" name="active" rules={rules}>
              <Select placeholder="Chọn trạng thái">
                <Option value={true}>Còn hạn</Option>
                <Option value={false}>Hết hạn</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Thuộc tính" name="attribute" rules={rules}>
              <Select placeholder="Chọn thuộc tính">
                <Option value="amount">amount (tổng tiền) </Option>
                <Option value="quantity">quantity (số lượng) </Option>
              </Select>
            </Form.Item>

            <Form.Item label="Dấu" name="operator" rules={rules}>
              <Select placeholder="Chọn toán tử">
                <Option value=">">&gt;</Option>
                <Option value=">=">&gt;=</Option>
                <Option value="<">&lt;</Option>
                <Option value="<=">&lt;=</Option>
                <Option value="==">==</Option>
                <Option value="=">=</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Giá trị" name="value" rules={rules}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                step={1}
                placeholder="VD: 50000 (tổng tiền) hoặc 3 (số lượng)"
              />
            </Form.Item>

            <Form.Item label="Loại giảm" name="is_percent" rules={rules}>
              <Select placeholder="Chọn loại giảm">
                <Option value={true}>Giảm phần trăm</Option>
                <Option value={false}>Giảm tiền</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Giảm giá"
              name="discount_amount"
              rules={[{ validator: discountValidator }]}
            >
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item label="Áp dụng" name="apply_to_all" rules={rules}>
              <Select placeholder="Chọn hình thức áp dụng">
                <Option value={true}>Áp dụng cho tất cả</Option>
                <Option value={false}>Áp dụng có điều kiện</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle //cho phép lồng Form Item
              shouldUpdate={(prevValues, curValues) =>
                prevValues.apply_to_all !== curValues.apply_to_all
              } //làm cho phần con re-render khi giá trị form thay đổi.
            >
              {({ getFieldValue }) =>
                getFieldValue("apply_to_all") === false ? (
                  <Form.Item
                    label="Chọn sản phẩm áp dụng"
                    name="product_id"
                    rules={[
                      {
                        required: true,
                        message:
                          "Vui lòng chọn ít nhất 1 sản phẩm khi chọn áp dụng có điều kiện",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn sản phẩm"
                      options={products}
                      loading={loadingProducts}
                      showSearch
                      optionFilterProp="label"
                      onSearch={(val) => fetchProducts(val)}
                      onFocus={() => {
                        if (products.length === 0) fetchProducts("");
                      }} //Tự động load danh sách sản phẩm khi focus vào Select lần đầu
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Thêm mới
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </>
  );
}

export default CreateCoupon;
