import React from "react";
import { Card, Typography, Space, Row, Col, Divider } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import "./Contact.css";

const { Title, Text, Paragraph } = Typography;

function Contact() {
  return (
    <>
      <div className="contact-page">
        <div className="contact-header">
          <Title level={1} className="contact-title">
            Liên Hệ Với Chúng Tôi
          </Title>
          <Text className="contact-subtitle">
            Sneaker Store - Nơi Phong Cách Bắt Đầu Từ Đôi Giày
          </Text>
        </div>

        <div className="contact-container">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card className="contact-info-card" bordered={false}>
                <Title level={3} className="card-title">
                  <CustomerServiceOutlined className="title-icon" />
                  Thông Tin Liên Hệ
                </Title>

                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div className="contact-item contact-item-phone">
                    <PhoneOutlined className="contact-icon" />
                    <div>
                      <Text strong className="contact-label">
                        Hotline
                      </Text>
                      <Text className="contact-value contact-phone">
                        0123 456 789
                      </Text>
                      <Text className="contact-note">(Miễn phí - 24/7)</Text>
                    </div>
                  </div>

                  <div className="contact-item contact-item-email">
                    <MailOutlined className="contact-icon" />
                    <div>
                      <Text strong className="contact-label">
                        Email
                      </Text>
                      <Text className="contact-value contact-email">
                        info@sneakerstore.vn
                      </Text>
                      <Text className="contact-note">Phản hồi trong 24h</Text>
                    </div>
                  </div>

                  <div className="contact-item contact-item-facebook">
                    <FacebookOutlined className="contact-icon" />
                    <div>
                      <Text strong className="contact-label">
                        Facebook
                      </Text>
                      <Text>Cửa hàng giày Sneaker Store</Text>
                      <Text className="contact-note">
                        Chat trực tiếp với chúng tôi
                      </Text>
                    </div>
                  </div>

                  <div className="contact-item contact-item-address">
                    <EnvironmentOutlined className="contact-icon" />
                    <div>
                      <Text strong className="contact-label">
                        Địa Chỉ Cửa Hàng
                      </Text>
                      <Text className="contact-value">
                        55 Giải Phóng, Hai Bà Trưng, Hà Nội
                      </Text>
                    </div>
                  </div>

                  <div className="contact-item contact-item-time">
                    <ClockCircleOutlined className="contact-icon" />
                    <div>
                      <Text strong className="contact-label">
                        Giờ Làm Việc
                      </Text>
                      <Text className="contact-value">
                        Thứ 2 - Thứ 6: 8:00 - 21:00
                      </Text>
                      <Text className="contact-value">
                        Thứ 7 - Chủ nhật: 9:00 - 22:00
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card className="map-card" bordered={false}>
                <Title level={3} className="card-title">
                  <EnvironmentOutlined className="title-icon title-icon-map" />
                  Vị Trí Cửa Hàng
                </Title>
                
                <div className="map-container">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.0647861332823!2d105.83865971050503!3d20.99003998902729!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad00573c87e3%3A0x34f21b383e2e0ea0!2zxJDhuqFpIGjhu41jIHjDonkgZOG7sW5nIGjDoCBu4buZaQ!5e0!3m2!1svi!2s!4v1763147984379!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowfullscreen=""
                    loading="lazy"
                    title="Bản đồ cửa hàng Sneaker Store"
                  />
                </div>
         
                <Divider />
                <div className="important-notes">
                  <Title level={4} className="notes-title">
                    💬 Lưu Ý Quan Trọng
                  </Title>
                  <Paragraph className="note-item">
                    • Mọi thắc mắc hay đóng góp ý kiến, xin quý khách hãy liên
                    hệ với cửa hàng chúng tôi!
                  </Paragraph>
                  <Paragraph className="note-item">
                    • Chúng tôi cam kết phản hồi trong vòng 24 giờ làm việc.
                  </Paragraph>
                  <Paragraph className="note-item note-item-last">
                    • Hỗ trợ tư vấn miễn phí qua hotline và Facebook.
                  </Paragraph>
                </div>
              </Card>
            </Col>
          </Row>

          <Card className="footer-card" bordered={false}>
            <Title level={3} className="footer-title">
              ❤️ Cảm Ơn Quý Khách Đã Tin Tưởng Sneaker Store!
            </Title>
            <Text className="footer-text">
              Chúng tôi luôn sẵn sàng đồng hành cùng phong cách của bạn
            </Text>
          </Card>
        </div>
      </div>
    </>
  );
}

export default Contact;
