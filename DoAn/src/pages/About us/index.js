import { Row, Col, Card, Button, Typography, Divider } from "antd";
import {
  HeartOutlined,
  ShoppingOutlined,
  SmileOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import "./AboutUs.css";
import {  Link, NavLink } from "react-router-dom";

const { Title, Paragraph } = Typography;

function AboutUs() {
  return (
    <>
      <div className="about-modern">
        <section className="about-hero">
          <div className="overlay">
            <Title level={1} className="hero-title">
              Step Into Style
            </Title>
            <Paragraph className="hero-subtitle">
              Chào mừng bạn đến với <b>Sneaker Store</b> – nơi đam mê và phong cách
              gặp nhau trong từng đôi giày.
            </Paragraph>
            <Button
              type="primary"
              size="large"
              shape="round"
              className="hero-btn"
            >
              <Link to="/">Mua ngay</Link>
            </Button>
          </div>
        </section>

        <section className="brand-story">
          <Row gutter={[40, 40]} align="middle">
            <Col xs={24} md={12}>
              <Title level={2} className="section-title">
                Câu chuyện khởi nguồn
              </Title>
              <Paragraph className="section-text">
                Tại <b>Sneaker Store</b>, chúng tôi không chỉ bán giày – chúng tôi
                truyền cảm hứng để bạn tự tin bước đi theo phong cách riêng. Mỗi
                đôi sneaker là một tuyên ngôn về sự sáng tạo, năng lượng và cá
                tính.
              </Paragraph>
              <Paragraph className="section-text">
                Được thành lập bởi những người yêu giày chân chính, chúng tôi
                mang đến trải nghiệm mua sắm trọn vẹn – nơi bạn có thể cảm nhận
                từng chi tiết, từng chất liệu, và cả tinh thần của street
                culture.
              </Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <div
                className="story-poster"
                role="img"
                aria-label="Sneaker lifestyle background"
              />
            </Col>
          </Row>
        </section>

        <section className="highlight-section">
          <Divider className="divider" plain>
            <Title level={3} className="divider-title">
              Vì sao bạn sẽ yêu Sneaker Store ?
            </Title>
          </Divider>

          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} md={8}>
              <Card hoverable className="highlight-card">
                <ThunderboltOutlined className="icon" />
                <Title level={4}>Xu hướng toàn cầu</Title>
                <Paragraph>
                  Luôn cập nhật các thiết kế hot nhất từ Nike, Adidas, New
                  Balance và Jordan.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable className="highlight-card">
                <HeartOutlined className="icon" />
                <Title level={4}>Chất lượng được đảm bảo</Title>
                <Paragraph>
                  100% chính hãng – đặt uy tín và trải nghiệm khách hàng lên
                  hàng đầu.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable className="highlight-card">
                <ShoppingOutlined className="icon" />
                <Title level={4}>Trải nghiệm dễ dàng</Title>
                <Paragraph>
                  Mua sắm nhanh, thanh toán linh hoạt, giao hàng toàn quốc.
                </Paragraph>
              </Card>
            </Col>

            <Col xs={24} md={8}>
              <Card hoverable className="highlight-card">
                <TrophyOutlined className="icon" />
                <Title level={4}>Chính hãng & minh bạch</Title>
                <Paragraph>
                  Hóa đơn đầy đủ, kiểm định nguồn gốc rõ ràng cho từng sản phẩm.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable className="highlight-card">
                <SmileOutlined className="icon" />
                <Title level={4}>Hậu mãi tận tâm</Title>
                <Paragraph>
                  Đổi trả linh hoạt, hỗ trợ size và bảo quản – luôn sát cánh
                  cùng bạn.
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card hoverable className="highlight-card">
                <HeartOutlined className="icon" />
                <Title level={4}>Cộng đồng đam mê</Title>
                <Paragraph>
                  Sự kiện offline/online, review chân thực từ chính khách hàng
                  của chúng tôi.
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </section>

        <section className="stats-strip" aria-label="Company statistics">
          <Row gutter={[16, 16]} justify="center">
            <Col xs={12} md={6} className="stat-item">
              <div className="stat-number">+5 năm</div>
              <div className="stat-label">Đồng hành cùng sneakerhead</div>
            </Col>
            <Col xs={12} md={6} className="stat-item">
              <div className="stat-number">10k+</div>
              <div className="stat-label">Khách hàng hài lòng</div>
            </Col>
            <Col xs={12} md={6} className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Mẫu luôn sẵn kho</div>
            </Col>
            <Col xs={12} md={6} className="stat-item">
              <div className="stat-number">4.8/5</div>
              <div className="stat-label">Điểm đánh giá trung bình</div>
            </Col>
          </Row>
        </section>

        <section className="cta-section">
          <Title level={2}>Ready to step up your game?</Title>
          <Paragraph>Khám phá bộ sưu tập mới nhất hôm nay!</Paragraph>
          <Button type="primary" size="large" className="cta-btn">
            <NavLink to="/" > Mua ngay</NavLink>
          </Button>
        </section>
      </div>
    </>
  );
}

export default AboutUs;
