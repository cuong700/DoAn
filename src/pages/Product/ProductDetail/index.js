

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Image,
  Typography,
  Tag,
  Button,
  InputNumber,
  Divider,
  Space,
  message,
  Card,
  Select,
} from "antd";
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import "./ProductDetail.css";
import ProductComment from "./ProductComment";
import { getCookie } from "../../../helpers/cookie";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  
  const [selectedSize, setSelectedSize] = useState(null); // {id, name, total}
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);


  const formatDate = (dateString) => {
    if (!dateString) return "";
    return dateString.split(" ")[0];
  };

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8090/api/v1/products/public/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.id) {
          throw new Error("Dữ liệu sản phẩm không hợp lệ");
        }

        setProduct(data);
        setQty(1);
        
        // Tự động chọn size đầu tiên với đầy đủ thông tin
        if (data.sizes && data.sizes.length > 0) {
          const firstSize = data.sizes[0];
          setSelectedSize({
            id: firstSize.id,
            name: firstSize.name,
            total: firstSize.total
          });
        }
      })
      .catch((err) => {
        console.error("Fetch product detail error:", err);
        message.error("Không thể tải thông tin sản phẩm");
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pd-loading">Đang tải sản phẩm...</div>;

  if (!product)
    return <div className="pd-loading">Không tìm thấy sản phẩm</div>;

  const discountPercent =
    product.display_price > 0
      ? Math.round(
          ((product.price - product.display_price) / product.price) * 100
        )
      : 0;

  // Lấy số lượng tồn kho của size đã chọn
  const currentStock = selectedSize ? selectedSize.total : product.total_stock || 0;

  //lưu đầy đủ thông tin size
  const handleSizeChange = (sizeName) => {
    const size = product.sizes.find((s) => s.name === sizeName);
    if (size) {
      setSelectedSize({
        id: size.id,
        name: size.name,
        total: size.total
      });
    }
  };

      // Tính giá cuối cùng (ưu tiên display_price nếu có sale)
    const finalPrice = product.display_price && product.display_price > 0 
      ? product.display_price 
      : product.price;

  const handleBuyNow = () => {
    const token = getCookie("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!selectedSize) {
      message.warning("Vui lòng chọn size!");
      return;
    }

    if (currentStock <= 0) {
      message.error("Size này đã hết hàng!");
      return;
    }

    navigate("/checkout", {
      state: {
        product: {
          id: product.id,
          name: product.name,
          thumbnail: product.thumbnail,
          price: finalPrice,              //Giá sau sale (nếu có)
          display_price: finalPrice,      // Giá hiển thị
          selectedSize: selectedSize.id,        
          selectedSizeName: selectedSize.name, 
          quantity: qty,
        },
      },
    });
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const index = cart.findIndex(
      (item) =>
        item.product_id === product.id &&
        item.size_id === selectedSize.id
    );

    if (index !== -1) {
      cart[index].quantity += qty;
    } else {
      cart.push({
        id: Date.now(),              // Cart.jsx dùng item.id
        product_id: product.id,
         name: product.name,
        price: Number(finalPrice),
        quantity: qty,
        size_id: selectedSize.id, 
         size: selectedSize.name,
        product_thumbnail: product.thumbnail,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));


    window.dispatchEvent(new Event("cartUpdated"));

    message.success(`Đã thêm ${qty} sản phẩm vào giỏ!`);

  };
  return (
    <div className="pd-wrapper">
      <Card className="pd-card">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <Image.PreviewGroup>
              <Image
                className="pd-main-image"
                preview={{
                  mask: null,
                }}
                src={`http://localhost:8090${product.thumbnail}`}
                alt={product.name}
                crossOrigin="anonymous"
      
              />
              <div className="pd-thumb-list">
                {product.images?.map((item, index) => (
                  <Image
                    key={index}
                    width={70}
                    height={70}
                    src={`http://localhost:8090${item}`}
                    alt={`thumb-${index}`}
                    className="pd-thumb"
                    preview={{
                      mask: null,
                    }}
                    crossOrigin="anonymous"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </Col>

          <Col xs={24} md={14}>
            <Title level={3} className="pd-title">
              {product.name}
            </Title>

            <Space size="middle" wrap>
              <Tag color="blue">{product.category_name}</Tag>
              {product.in_stock && product.total_stock > 0 ? (
                <Tag icon={<CheckCircleOutlined />} color="green">
                  Còn hàng ({product.total_stock})
                </Tag>
              ) : (
                <Tag color="red">Hết hàng</Tag>
              )}
              {product.active && <Tag color="success">Đang bán</Tag>}
            </Space>

            <Divider />

            <div className="pd-price">
              {discountPercent > 0 ? (
                <>
                  <Title level={2} className="pd-price-new">
                    {product.display_price.toLocaleString("vi-VN")} đ
                  </Title>
                  <Text delete className="pd-price-old">
                    {product.price.toLocaleString("vi-VN")} đ
                  </Text>
                  <Tag color="red" className="pd-discount">
                    -{discountPercent}%
                  </Tag>
                </>
              ) : (
                <Title level={2} className="pd-price-new">
                  {product.price.toLocaleString("vi-VN")} đ
                </Title>
              )}
            </div>

            <Paragraph className="pd-desc">{product.description}</Paragraph>

            <div className="pd-info">
              <Space direction="vertical" size="small">
                {product.weight > 0 && (
                  <Text>
                    <strong>Trọng lượng:</strong> {product.weight} g
                  </Text>
                )}
                {product.created_at && (
                  <Text>
                    <strong>Ngày thêm:</strong> {formatDate(product.created_at)}
                  </Text>
                )}
              </Space>
            </div>

            <Divider />

            {/* Chọn size */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pd-size">
                <Text strong>Chọn size:</Text>
                <Select
                  value={selectedSize?.name}
                  onChange={handleSizeChange}
                  style={{ marginLeft: 12, width: 120 }}
                  placeholder="Chọn size"
                >
                  {product.sizes.map((size) => (
                    <Option
                      key={size.id}
                      value={size.name}
                      disabled={size.total <= 0}
                    >
                      {size.name} {size.total <= 0 && "(Hết hàng)"}
                    </Option>
                  ))}
                </Select>
              </div>
            )}

            {/* Số lượng */}
            <div className="pd-qty" style={{ marginTop: 16 }}>
              <Text strong>Số lượng:</Text>
              <InputNumber
                min={1}
                max={currentStock || 99}
                value={qty}
                onChange={(v) => setQty(v)}
                style={{ marginLeft: 12 }}
                disabled={!selectedSize || currentStock <= 0}
              />
              {selectedSize && (
                <Text type="secondary" style={{ marginLeft: 12 }}>
                  Còn {currentStock} sản phẩm
                </Text>
              )}
            </div>

            <div className="pd-actions">
              <Button
                size="large"
                icon={<ShoppingCartOutlined />}
                className="pd-addcart-btn"
                onClick={handleAddToCart}
                disabled={
                  !product.in_stock || currentStock <= 0 || !selectedSize
                }
              >
                Thêm vào giỏ hàng
              </Button>

              <Button
                size="large"
                type="primary"
                danger
                icon={<ThunderboltOutlined />}
                className="pd-buynow-btn"
                onClick={handleBuyNow}
                disabled={
                  !product.in_stock || currentStock <= 0 || !selectedSize
                }
              >
                Mua ngay
              </Button>
            </div>
          </Col>
        </Row>

        <Divider style={{ marginTop: 40 }} />

        <ProductComment productId={id} />
      </Card>
    </div>
  );
}

export default ProductDetail;