import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  Typography,
  Rate,
  Tag,
  Button,
  InputNumber,
  Divider,
  Space,
  message,
  Card,
} from "antd";
import { ShoppingCartOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "./ProductDetail.css";

const { Title, Text, Paragraph } = Typography;

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`https://dummyjson.com/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setQty(1);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pd-loading">Đang tải sản phẩm...</div>;

  if (!product)
    return <div className="pd-loading">Không tìm thấy sản phẩm</div>;

  const newPrice = ((product.price * (100 - product.discountPercentage)) / 100 ).toFixed(2);

  const handleAddToCart = () => {
    // TODO: nối với cart state / context của bạn ở đây
    message.success(`Đã thêm ${qty} sản phẩm vào giỏ!`);
  };

  return (
    <div className="pd-wrapper">
      <Card className="pd-card" >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Image.PreviewGroup>
              <Image
                className="pd-main-image"
                src={product.thumbnail}
                alt={product.title}
              />
              <div className="pd-thumb-list">
                {product.images?.map((item, index) => ( //tránh lỗi nếu images chưa có.
                  <Image
                    key={index}
                    width={70}
                    height={70}
                    src={item}
                    alt={`thumb-${index}`}
                    className="pd-thumb"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </Col>


          <Col xs={24} md={14}>
            <Title level={3} className="pd-title">
              {product.title}
            </Title>

            <Space size="middle" wrap>
              <Tag color="blue">{product.brand}</Tag>
              <Tag color="geekblue">{product.category}</Tag>
              {product.stock > 0 ? (
                <Tag icon={<CheckCircleOutlined />} color="green">
                  Còn hàng ({product.stock})
                </Tag>
              ) : (
                <Tag color="red">Hết hàng</Tag>
              )}
            </Space>

            <div className="pd-rating">
              <Rate disabled allowHalf value={product.rating} />
              <Text type="secondary" style={{ marginLeft: 8 }}>
                ({product.rating})
              </Text>
            </div>

            <Divider />

            <div className="pd-price">
              <Title level={2} className="pd-price-new">
                {newPrice}$
              </Title>
              <Text delete className="pd-price-old">
                {product.price}$
              </Text>
              <Tag color="red" className="pd-discount">
                -{product.discountPercentage}%
              </Tag>
            </div>

            <Paragraph className="pd-desc">{product.description}</Paragraph>

            <Divider />

            <div className="pd-qty">
              <Text strong>Số lượng:</Text>
              <InputNumber
                min={1}
                max={product.stock || 99}
                value={qty}
                onChange={(v) => setQty(v)}
                style={{ marginLeft: 12 }}
              />
            </div>

            <Button
              
              size="large"
              icon={<ShoppingCartOutlined />}
              className="pd-addcart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Thêm vào giỏ hàng
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ProductDetail;
