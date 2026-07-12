import API_BASE_URL from '../../../config/api';


import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Row, Col, Image, Typography, Tag, Button,
  InputNumber, Divider, Space, message, Card, Tooltip,
} from "antd";
import {
  ShoppingCartOutlined, CheckCircleOutlined, ThunderboltOutlined,
} from "@ant-design/icons";
import "./ProductDetail.css";
import ProductComment from "./ProductComment";
import { getCookie } from "../../../helpers/cookie";

const { Title, Text, Paragraph } = Typography;
const API = API_BASE_URL;

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct]       = useState(null);
  const [qty, setQty]               = useState(1);
  const [selectedSize, setSelectedSize] = useState(null); // {id, name, total}
  const [selectedColor, setSelectedColor] = useState(null); // {id, color_name, color_code}
  const [mainImage, setMainImage]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [id]);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/v1/products/public/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || !data.id) throw new Error("Dữ liệu sản phẩm không hợp lệ");
        setProduct(data);
        setQty(1);
        setMainImage(data.thumbnail ? `${API}${data.thumbnail}` : null);

        // Tự động chọn size đầu tiên
        if (data.sizes?.length > 0) {
          const first = data.sizes[0];
          setSelectedSize({ id: first.id, name: first.name, total: first.total });
        }
        // Tự động chọn màu đầu tiên nếu có
        if (data.colors?.length > 0) {
          const firstColor = data.colors[0];
          setSelectedColor({ id: firstColor.id, color_name: firstColor.color_name, color_code: firstColor.color_code });
          // Set ảnh theo màu đầu tiên nếu có
          const colorImg = data.images?.find((img) => img.color_id === firstColor.id);
          if (colorImg) setMainImage(`${API}${colorImg.image_url}`);
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
  if (!product) return <div className="pd-loading">Không tìm thấy sản phẩm</div>;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const buildUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API}${path}`;
  };

  const discountPercent =
    product.display_price != null
      ? Math.round(((product.price - product.display_price) / product.price) * 100)
      : 0;

  const finalPrice = product.display_price ?? product.price;

  // Tồn kho của size đang chọn
  const currentStock = selectedSize ? selectedSize.total : product.total_stock || 0;

  // Ảnh hiển thị trong thumbnail strip:
  // - Nếu có màu được chọn → ảnh của màu đó + thumbnail chính
  // - Nếu không có màu → tất cả ảnh
  const getThumbImages = () => {
    if (!product.images?.length) return [];
    if (selectedColor) {
      const colorImgs = product.images.filter((img) => img.color_id === selectedColor.id);
      return colorImgs.length > 0 ? colorImgs : product.images;
    }
    return product.images;
  };

  const thumbImages = getThumbImages();

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    // Tìm ảnh đầu tiên của màu này
    const colorImg = product.images?.find((img) => img.color_id === color.id);
    if (colorImg) {
      setMainImage(buildUrl(colorImg.image_url));
    } else {
      // Không có ảnh riêng → dùng thumbnail chính
      setMainImage(buildUrl(product.thumbnail));
    }
    // Reset size khi đổi màu
    setSelectedSize(null);
  };

  const handleSizeChange = (sizeId) => {
    const size = product.sizes.find((s) => s.id === sizeId);
    if (size) setSelectedSize({ id: size.id, name: size.name, total: size.total });
  };

  const handleBuyNow = () => {
    const token = getCookie("token");
    if (!token) { navigate("/login"); return; }
    if (!selectedSize) { message.warning("Vui lòng chọn size!"); return; }
    if (currentStock <= 0) { message.error("Size này đã hết hàng!"); return; }
    navigate("/checkout", {
      state: {
        product: {
          id: product.id,
          name: product.name,
          thumbnail: product.thumbnail,
          price: finalPrice,
          display_price: finalPrice,
          selectedSize: selectedSize.id,
          selectedSizeName: selectedSize.name,
          quantity: qty,
        },
      },
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize) { message.warning("Vui lòng chọn size!"); return; }
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex(
      (item) => item.product_id === product.id && item.size_id === selectedSize.id
    );
    if (index !== -1) {
      cart[index].quantity += qty;
    } else {
      cart.push({
        id: Date.now(),
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pd-wrapper">
      <Card className="pd-card">
        <Row gutter={[24, 24]}>
          {/* ── Cột ảnh ── */}
          <Col xs={24} md={10}>
            {/* Ảnh chính */}
            <div style={{ borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
              <Image
                className="pd-main-image"
                preview={{
                  mask: null,
                }}
                src={`${API_BASE_URL}${product.thumbnail}`}
                alt={product.name}
                crossOrigin="anonymous"
                preview={{ mask: null }}
                style={{ width: "100%", maxHeight: 480, objectFit: "cover" }}
              />
            </div>

            {/* Thumbnail strip */}
            {thumbImages.length > 0 && (
              <div className="pd-thumb-list">
                {/* Thumbnail chính luôn hiển thị đầu */}
                <Image
                  width={70} height={70}
                  src={buildUrl(product.thumbnail)}
                  alt="main"
                  crossOrigin="anonymous"
                  className="pd-thumb"
                  preview={{ mask: null }}
                  style={{
                    objectFit: "cover", borderRadius: 4, cursor: "pointer",
                    border: mainImage === buildUrl(product.thumbnail) ? "2px solid #1890ff" : "2px solid transparent",
                  }}
                  onClick={() => setMainImage(buildUrl(product.thumbnail))}
                />
                {thumbImages.map((img, index) => (
                  <Image
                    key={index}
                    width={70}
                    height={70}
                    src={buildUrl(img.image_url)}
                    alt={`thumb-${index}`}
                    crossOrigin="anonymous"
                    className="pd-thumb"
                    preview={{ mask: null }}
                    style={{
                      objectFit: "cover", borderRadius: 4, cursor: "pointer",
                      border: mainImage === buildUrl(img.image_url) ? "2px solid #1890ff" : "2px solid transparent",
                    }}
                    onClick={() => setMainImage(buildUrl(img.image_url))}
                  />
                ))}
              </div>
            )}
          </Col>

          {/* ── Cột thông tin ── */}
          <Col xs={24} md={14}>
            <Title level={3} className="pd-title">{product.name}</Title>

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

            {/* Giá */}
            <div className="pd-price">
              {product.display_price != null && product.display_price !== product.price ? (
                <>
                  <Title level={2} className="pd-price-new">
                    {product.display_price.toLocaleString("vi-VN")} đ
                  </Title>
                  <Text delete className="pd-price-old">
                    {product.price.toLocaleString("vi-VN")} đ
                  </Text>
                  <Tag color="red" className="pd-discount">-{discountPercent}%</Tag>
                </>
              ) : (
                <Title level={2} className="pd-price-new">
                  {product.price.toLocaleString("vi-VN")} đ
                </Title>
              )}
            </div>

            <Paragraph className="pd-desc">{product.description}</Paragraph>

            {product.weight > 0 && (
              <div className="pd-info">
                <Text><strong>Trọng lượng:</strong> {product.weight} g</Text>
              </div>
            )}

            <Divider />

            {/* ── Chọn màu ── */}
            {product.colors?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>
                  Màu sắc:{" "}
                  {selectedColor && (
                    <Text type="secondary" style={{ fontWeight: 400, marginLeft: 8 }}>
                      {selectedColor.color_name}
                    </Text>
                  )}
                </Text>
                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                  {product.colors.map((color) => (
                    <Tooltip key={color.id} title={color.color_name}>
                      <div
                        onClick={() => handleColorSelect(color)}
                        style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: color.color_code,
                          border: selectedColor?.id === color.id
                            ? "3px solid #1890ff"
                            : "2px solid #d9d9d9",
                          cursor: "pointer",
                          boxShadow: selectedColor?.id === color.id
                            ? "0 0 0 2px #fff, 0 0 0 4px #1890ff"
                            : "none",
                          transition: "all 0.2s",
                        }}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}

            {/* ── Chọn size ── */}
            {product.sizes?.length > 0 && (
              <div className="pd-size" style={{ marginBottom: 16 }}>
                <Text strong>Chọn size:</Text>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {product.sizes.map((size) => {
                    const isSelected = selectedSize?.id === size.id;
                    const outOfStock = size.total <= 0;
                    return (
                      <div
                        key={size.id}
                        onClick={() => !outOfStock && handleSizeChange(size.id)}
                        style={{
                          minWidth: 48, height: 40, borderRadius: 6,
                          border: isSelected ? "2px solid #1890ff" : "1.5px solid #d9d9d9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: "0 12px",
                          cursor: outOfStock ? "not-allowed" : "pointer",
                          background: isSelected ? "#e6f4ff" : outOfStock ? "#f5f5f5" : "#fff",
                          color: outOfStock ? "#bbb" : isSelected ? "#1890ff" : "#333",
                          fontWeight: isSelected ? 700 : 400,
                          textDecoration: outOfStock ? "line-through" : "none",
                          transition: "all 0.2s",
                          fontSize: 14,
                        }}
                      >
                        {size.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tồn kho */}
            {selectedSize && (
              <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Còn {currentStock} sản phẩm
              </Text>
            )}

            {/* ── Số lượng ── */}
            <div className="pd-qty">
              <Text strong>Số lượng:</Text>
              <InputNumber
                min={1} max={currentStock || 99} value={qty}
                onChange={(v) => setQty(v)}
                style={{ marginLeft: 12 }}
                disabled={!selectedSize || currentStock <= 0}
              />
            </div>

            {/* ── Buttons ── */}
            <div className="pd-actions">
              <Button
                size="large"
                icon={<ShoppingCartOutlined />}
                className="pd-addcart-btn"
                onClick={handleAddToCart}
                disabled={!product.in_stock || currentStock <= 0 || !selectedSize}
              >
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="large" type="primary" danger
                icon={<ThunderboltOutlined />}
                className="pd-buynow-btn"
                onClick={handleBuyNow}
                disabled={!product.in_stock || currentStock <= 0 || !selectedSize}
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
