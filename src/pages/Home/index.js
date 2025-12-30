import "./home.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Row, Col } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8090/api/v1/products/public/search"
      );
      const data = await response.json();
      setProducts(data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    }
  };

  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
  };

  if (loading) {
    return <div className="section6-loading">Loading products...</div>;
  }

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div>
      <div className="section2">
        <div className="hop">
          <div className="content-wrap">
            <div className="header">
              <div className="text1">
                Move, Shop, Customise & Celebrate With Us.
              </div>
              <div className="text2">
                No matter what you feel like doing today, It’s better as a
                Member.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section3">
        <div className="container-fluid">
          <div
            className="anh wow animate__animated animate__zoomIn"
            data-wow-duration="1.2s"
            data-wow-delay="0s"
            data-wow-iteration-count="infinite"
          ></div>
        </div>
      </div>

      <div className="section35">
        <div className="hop">
          <div className="inner-wrap">
            <div className="header">
              <div className="text1" style={{ fontSize: "30px" }}>
                JUST DO IT.
              </div>
              <div className="text2">
                <span style={{ marginRight: "20px" }}> YOU CAN'T</span>
                <span>STOP SPORT.</span>
              </div>
              <div className="text3" style={{ marginBottom: "10px" }}>
                NIKE IS YOUR LIFE AND NICE TOO.
              </div>
              <div className="shop">
                <div className="text">shop</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add other sections and elements as needed */}

      <div className="section5">
        <div className="container-custom">
          <div className="wrap">
            <Row gutter={[28, 28]}>
              <Col xs={24} lg={16}>
                <div className="s5-box">
                  <div className="s5-card large">
                    <img
                      src="https://sneakernews.com/wp-content/uploads/2019/11/g-dragon-nike-air-force-1-release-date-1.jpg"
                      alt=""
                    />

                    <div className="s5-text">
                      <div className="title">NIKE x G-Dragon</div>
                      <div className="s5-btn">Shop</div>
                    </div>
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className="s5-box">
                  <div className="s5-card large">
                    <img
                      src="https://images.milledcdn.com/2020-02-29/pKt-IWeAqLWKcIaP/wvUrvAOEh5_4.png"
                      alt=""
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          <div className="wrap">
            <Row gutter={[28, 28]}>
              <Col xs={24} lg={14}>
                <div className="s5-box">
                  <div className="s5-card medium">
                    <img
                      src="https://camijohanson.files.wordpress.com/2019/07/nike-print-ads-4.jpg"
                      alt=""
                    />
                  </div>
                </div>
              </Col>

              <Col xs={24} lg={10}>
                <div className="s5-box">
                  <div className="s5-card medium">
                    <img
                      src="https://i.pinimg.com/originals/54/70/30/547030b6dc2d081c1275342ec827838d.gif"
                      alt=""
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <div className="section35" style={{ paddingTop: "50px" }}>
        <div className="hop">
          <div className="inner-wrap">
            <div className="header">
              <div className="text1" style={{ fontSize: "20px" }}>
                Nike Invincible 3
              </div>
              <div className="text2">
                <span style={{ marginRight: "20px" }}>
                  FEEL IT TO BELIEVE IT.
                </span>
              </div>
              <div className="text3" style={{ marginBottom: "10px" }}>
                Take cushion for a run with new colors in the Invincible 3.
              </div>
              <div className="shop">
                <div className="text">shop</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section6">
        <div className="section6-container">
          <h2 className="section6-title">New Year, New Arrivals</h2>

          <Slider {...settings}>
            {products.map((product) => (
              <div key={product.id} className="product-slide">
                <div
                  className="product-card1"
                  onClick={() => handleProductClick(product.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="product-image-wrapper1">
                    <img
                      src={`http://localhost:8090${product.thumbnail}`}
                      alt={product.name}
                      className="product-image1"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="product-info1">
                    <div className="product-name1">{product.name}</div>

                    <div className="product-category1">
                      {product.category_name}
                    </div>

                    {product.display_price && product.display_price < product.price ? (
                      <>
                        <div className="product__price-new1">
                          {product.display_price.toLocaleString("vi-VN")} đ
                        </div>
                        <div className="product__price-old1">
                          {product.price.toLocaleString("vi-VN")} đ
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="product__price-new1">
                          {product.price.toLocaleString("vi-VN")} đ
                        </div>

                        {/* placeholder để giữ chiều cao */}
                        <div className="product__price-old placeholder"> </div>
                      </>
                    )}
                    {product.special_offer && product.discount_badge && (
                      <div className="product-badge1">
                        {product.discount_badge}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </div>
  );
}

export default Home;
