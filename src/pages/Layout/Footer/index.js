import React from "react";
import {
  Layout,
  Row,
  Col,
  Space,
  Typography,
  Divider,
} from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from "@ant-design/icons";
import "./Footer.css";

const { Footer } = Layout;
const { Title, Text, Link } = Typography;

const ShoeStoreFooter = () => {
  return (
    <Footer className="shoe-store-footer">
      <Row gutter={[24, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            SNEAKER STORE
          </Title>
          <Text className="footer-description">
            Chuyên cung cấp giày sneaker chính hãng với đa dạng mẫu mã từ các
            thương hiệu hàng đầu thế giới.
          </Text>
          <Space size="large" className="social-space">
            <FacebookOutlined className="social-icon" />
            <InstagramOutlined className="social-icon" />
            <TwitterOutlined className="social-icon" />
            <YoutubeOutlined className="social-icon" />
          </Space>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            LIÊN KẾT NHANH
          </Title>
          <Link className="footer-link">Trang chủ</Link>
          <Link className="footer-link">Sản phẩm</Link>
          <Link className="footer-link">Giới thiệu</Link>
          <Link className="footer-link">Tin tức</Link>
          <Link className="footer-link">Liên hệ</Link>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            CHÍNH SÁCH
          </Title>
          <Link className="footer-link">Chính sách đổi trả</Link>
          <Link className="footer-link">Chính sách bảo mật</Link>
          <Link className="footer-link">Điều khoản dịch vụ</Link>
          <Link className="footer-link">Hướng dẫn mua hàng</Link>
          <Link className="footer-link">Phương thức thanh toán</Link>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Title level={4} className="footer-section-title">
            LIÊN HỆ
          </Title>
          <Space
            direction="vertical"
            size="middle"
            className="contact-info-space"
          >
            <Text className="contact-info-text">
              <EnvironmentOutlined /> 55 Giải Phóng, Hai Bà Trưng, TP.Hà Nội
            </Text>
            <Text className="contact-info-text">
              <PhoneOutlined /> 0123 456 789
            </Text>
            <Text className="contact-info-text">
              <MailOutlined /> info@sneakerstore.vn
            </Text>
          </Space>

        </Col>
      </Row>

      <Divider className="footer-divider" />

      <Row justify="center">
        <Col>
          <Text className="footer-copyright">
            © 2025 Sneaker Store. All rights reserved
          </Text>
        </Col>
      </Row>
    </Footer>
  );
};

export default ShoeStoreFooter;
