import { Button, DatePicker, Form, Input, notification, Spin } from "antd";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../../../helpers/cookie";
import dayjs from "dayjs";

function Profile() {
  const [form] = Form.useForm();

  const [spinning, setSpinning] = useState(false);

  const [notiApi, contextHolder] = notification.useNotification();

  
  const mapUser = (u) => ({
    fullname: u.fullname ?? "",
    phone_number: u.phone_number ?? "",
    address: u.address ?? "",
    created_at: u.created_at ?? "",
    updated_at: u.updated_at ?? "",
    date_of_birth: u.date_of_birth
      ? dayjs(u.date_of_birth, "YYYY-MM-DD")
      : null,
  });

  const fetchApi = async () => {
    try {
      const userId = getCookie("userid");
      const token = getCookie("token");

      const res = await fetch(
        "http://localhost:8090/api/v1/users/admin/get-all-user",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Không lấy được thông tin user");

      const json = await res.json();
      const list = json.data;

      const found = list.find((u) => String(u.id) === String(userId)); // Tìm user ứng với id

      if (!found) {
        console.warn("Không tìm thấy user theo ID:", userId);
        return;
      }
      form.setFieldsValue(mapUser(found));

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchApi();
  }, []);

  const handleSubmit = async (value) => {
    try {
      setSpinning(true);
      const id = getCookie("userid");
      const token = getCookie("token");

      const payload = {
        fullname: value.fullname,
        phone_number: value.phone_number,
        address: value.address,
        date_of_birth: value.date_of_birth
          ? value.date_of_birth.format("YYYY-MM-DD")
          : null,
      };

      const res = await fetch(
        `http://localhost:8090/api/v1/users/user/details/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(payload), 
        }
      );

      console.log(payload);

      if (!res.ok) throw new Error("Update thất bại");


      notiApi.success({
        message: "Cập nhật thành công",
        description: "Thông tin quản trị viên đã được cập nhật.",
      });
      
      setCookie("name", value.fullname, 1);// cập nhật cookie giao diện
      fetchApi(); // load lại dữ liệu mới
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
          <Form.Item label="Họ và tên" name="fullname" rules={rules}>
            <Input />
          </Form.Item>

          <Form.Item label="Ngày sinh" name="date_of_birth" rules={rules}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Số điện thoại" name="phone_number" rules={rules}>
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
