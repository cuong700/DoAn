
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./SearchPage.css";

function Searchpage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const keyword = query.get("keyword") || "";
  

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Gọi API tìm kiếm với keyword
    fetch(`http://localhost:8090/api/v1/products/public/search?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&size=10`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        // Xử lý dữ liệu trả về theo cấu trúc API
        if (data && Array.isArray(data.data)) {
          setResults(data.data);
          setTotalPages(data.total_pages || 0);
          setTotalElements(data.total_elements || 0);
        } else {
          setResults([]);
          setTotalPages(0);
          setTotalElements(0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching search results:", err);
        setResults([]);
        setLoading(false);
      });
  }, [keyword, currentPage]);

  // Xử lý khi click vào sản phẩm
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Xử lý phân trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>
        {!loading && results.length > 0 && (
          <p className="search-count">Tìm thấy {results.length} sản phẩm</p>
        )}
      </div>


      {loading ? (
        <div className="loading">Đang tìm kiếm...</div>
      ) : results.length === 0 && keyword.trim() ? (
        <div className="no-results">
          <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{keyword}"</p>
          <p>Vui lòng thử lại với từ khóa khác</p>
        </div>
      ) : (
        <>
          <div className="search-results">
            {results.map((product) => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="product-image">
                  <img 
                    src={`http://localhost:8090${product.thumbnail}`}
                    alt={product.name}
                    crossOrigin="anonymous"
                  />
                  {product.special_offer && product.discount_badge && (
                    <span className="discount-badge">{product.discount_badge}</span>
                  )}
                </div>
                
                <div className="product-info">
                  <div className="product-category">{product.category_name}</div>
                  
                  <h3 className="product-name">{product.name}</h3>
                  
                  <div className="product-pricing">
                    {product.display_price && product.display_price < product.price ? (
                      <>
                        <span className="display-price">
                          {product.display_price.toLocaleString("vi-VN")} đ
                        </span>
                        <span className="original-price">
                          {product.price.toLocaleString("vi-VN")} đ
                        </span>
                      </>
                    ) : (
                      <span className="display-price">
                        {product.price.toLocaleString("vi-VN")} đ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={currentPage === index ? 'active' : ''}
                  onClick={() => handlePageChange(index)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Searchpage;