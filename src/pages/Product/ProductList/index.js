import { useEffect, useState } from "react";
import "./ProductList.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import API_BASE_URL from '../../../config/api';

function ProductList() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [limit] = useState(10);

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  // Lấy sortBy từ URL
  const sortBy = searchParams.get("sortBy") || "";

  // Lấy page từ URL, mặc định là 1 (trang 1)
  const pageFromUrl = parseInt(searchParams.get("page") || "1");
  const page = pageFromUrl - 1; // Chuyển sang 0-indexed cho backend

  const fetchProducts = async () => {
    try {
      setLoading(true);

      let url = `${API_BASE_URL}/api/v1/products/public/search?page=${page}&limit=${limit}`;

      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }

      // Thêm sortBy vào URL
      if (sortBy) {
        url += `&sortBy=${sortBy}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      console.log("Dữ liệu sản phẩm trả về:", data.data[0]);
      let fetchedProducts = data.data || [];

      setProducts(fetchedProducts);
      setTotal(data.total_elements || 0);

      // Lấy tên danh mục từ sản phẩm đầu tiên
      if (data.data && data.data.length > 0) {
        setCategoryName(data.data[0].category_name);
      }
    } catch (err) {
      console.error("Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page về 1 khi categoryId thay đổi
  useEffect(() => {
    setSearchParams({});
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId, sortBy]);

  const totalPages = Math.ceil(total / limit);

  // Hàm thay đổi trang
  const handlePageChange = (newPageIndex) => {
    const displayPage = newPageIndex + 1;
    const newParams = {};

    // Giữ lại sortBy nếu có
    if (sortBy) {
      newParams.sortBy = sortBy;
    }

    if (displayPage !== 1) {
      newParams.page = displayPage.toString();
    }

    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hàm thay đổi bộ lọc với reload
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    const newParams = {};

    if (newSortBy) {
      newParams.sortBy = newSortBy;
    }

    // Reset về trang 1 khi thay đổi bộ lọc
    setSearchParams(newParams);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="product-container">
      <div className="product-toolbar">
        <h2 className="title">
          {categoryName ||
            (categoryId ? "Sản phẩm theo danh mục" : "Danh sách sản phẩm")}
        </h2>
        <div className="product-toolbar-right">
          <select
            className="filter-select"
            value={sortBy}
            onChange={handleSortChange}
          >
            <option value="">Sắp xếp theo</option>
            <option value="asc">Giá: Thấp đến cao</option>
            <option value="desc">Giá: Cao đến thấp</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="no-products">Không tìm thấy sản phẩm nào</div>
      ) : (
        <>
          <div className="product">
                  {products.map((item) => {
                    const salePrice = item.display_price;
                    const hasSale = salePrice !== null && salePrice !== undefined;

                    return (
                      <div
                        className="product__item"
                        key={item.id}
                        onClick={() => handleProductClick(item.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={`${API_BASE_URL}${item.thumbnail}`}
                          alt={item.name}
                          crossOrigin="anonymous"
                        />
                        <div className="product__category">{item.category_name}</div>

                        <h3 className="product__title">{item.name}</h3>

                        {hasSale && salePrice < item.price ? (
                          <>
                            <div className="product__price-new" style={{ color: "red", fontWeight: "bold" }}>
                              {salePrice === 0 ? "0 đ" : salePrice.toLocaleString("vi-VN") + " đ"}
                            </div>
                            <div className="product__price-old">
                              {item.price.toLocaleString("vi-VN")} đ
                            </div>

                            <div className="product__badge">
                              {salePrice === 0 ? "-100%" : item.discount_badge}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="product__price-new">
                              {item.price.toLocaleString("vi-VN")} đ
                            </div>
                            <div className="product__price-old placeholder"></div>
                          </>
                        )}
                      </div>
                    );
                  })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => handlePageChange(page - 1)}
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={page === i ? "active" : ""}
                  onClick={() => handlePageChange(i)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages - 1}
                onClick={() => handlePageChange(page + 1)}
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

export default ProductList;
