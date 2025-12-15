import "./home.css";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Row, Col } from "antd";

function Home() {
  const settings = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
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
          >
          </div>
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
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="title">New Year, New Arrivals</div>
              
              <Slider {...settings} className="product-list">
                <div className="product-item">
                  <a href="khanh">
                    <div className="product-img">
                      <img
                        src="https://product.hstatic.net/200000581855/product/giay_nike_air_jordan_1_mid_fitness_red_bq6472-06110_5cd7048655f847f1a808756af5a26bc7_master.jpeg"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
                <div className="product-item">
                  <a href="khanh">
                    <div className="product-img">
                      <img
                        src="https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_2.0/h_465,c_limit/a8317dc5-7ce1-42ff-b1da-71f08ff93ad4/court-vision-low-next-nature-shoes-N2fFHb.png"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
                <div className="product-item">
                  <a href="khan">
                    <div className="product-img">
                      <img
                        src="https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_2.0/h_465,c_limit/fcec289f-65ee-42d4-a340-9eed9cb51c27/air-max-90-shoes-PKcwg7.png"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
                <div className="product-item">
                  <a href="khanh">
                    <div className="product-img">
                      <img
                        src="https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_2.0/h_465,c_limit/88dd3883-4b00-462c-9c52-f28cd2033c93/air-jordan-1-low-se-shoes-m3sXwW.png"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
                <div className="product-item">
                  <a href="khanh">
                    <div className="product-img">
                      <img
                        src="https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_2.0/h_465,c_limit/b6ba0d7e-1ddc-4840-bc00-52afb05e448e/sportswear-tech-pack-dri-fit-short-sleeve-top-Bn1qLh.png"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
                <div className="product-item">
                  <a href="khanh">
                    <div className="product-img">
                      <img
                        src="https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_2.0/h_465,c_limit/b75b4429-a03b-4b36-853c-c3d664853c13/air-jordan-1-low-shoes-qBzpHW.png"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
                <div className="product-item">
                  <a href="khanh">
                    <div className="product-img">
                      <img
                        src="https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_2.0/h_465,c_limit/c7ceb7d0-b5ee-41c8-abf1-3c4c8e90aa5f/dunk-low-shoes-wbxcmN.png"
                        alt=""
                      />
                    </div>
                    <div className="product-title">
                      <div className="name">jordan</div>
                      <div className="sex">man</div>
                      <div className="gia">4000.00</div>
                    </div>
                  </a>
                </div>
              </Slider>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
