import { Button, DatePicker, Form, Input, notification, Spin } from "antd";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../../../helpers/cookie";
import dayjs from "dayjs";

function Profile() {
  const [form] = Form.useForm();

  const [spinning, setSpinning] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();

  const fetchApi = async () => {
    try {
      const userId = getCookie("userid");
      const token = getCookie("token");

      if (!userId || !token) return;

      const res = await fetch(`http://localhost:8090/api/v1/users/${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Không lấy được thông tin user");

      const data = await res.json();

      form.setFieldsValue({
        firstName: data.full_name || "",
        phone: data.phone_number || "",
        address: data.address || "",
        birthDate: data.date ? dayjs(data.date, "DD/MM/YYYY") : null,
        created_at: data.created_at
          ? dayjs(data.created_at).format("DD/MM/YYYY HH:mm")
          : "",
        updated_at: data.updated_at
          ? dayjs(data.updated_at).format("DD/MM/YYYY HH:mm")
          : "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApi();
  }, [form]);

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);
      const userId = getCookie("userid");
      const token = getCookie("token");

      const payload = {
        full_name: value.firstName,
        phone_number: value.phone,
        address: value.address,
        date: value.birthDate ? value.birthDate.format("DD/MM/YYYY") : null,
      };

      const res = await fetch(`http://localhost:8090/api/v1/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update thất bại");

      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin quản trị viên đã được cập nhật.",
      });

      setCookie("name", value.firstName, 1);
      setCookie("phone", value.phone, 1);
      setCookie("address", value.address, 1);
      if (value.birthDate) {
        setCookie("date", value.birthDate.format("DD/MM/YYYY"), 1);
      }

      await fetchApi(); //Gọi lại GET để cập nhập updated_at mới

    } catch (error) {
      console.error(error);
      notiApi.error({
        message: "Lỗi cập nhật thông tin",
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
      <h2>Thông tin quản trị viên</h2>

      {contextHolder}

      <Spin spinning={spinning} tip="Đang cập nhật...">
        <Form layout="vertical" onFinish={handleSubmit} form={form}>
          <Form.Item label="Họ và tên" name="firstName" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Ngày sinh" name="birthDate" rules={rules}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address" rules={rules}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item label="Ngày tạo" name="created_at" rules={rules}>
            <Input disabled />
          </Form.Item>

          <Form.Item label="Ngày cập nhật" name="updated_at" rules={rules}>
            <Input disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      </Spin>
    </>
  );
}

export default Profile;
