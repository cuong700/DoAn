import { useEffect, useState } from "react";
import "./ProductList.css";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

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

      let url = `http://localhost:8090/api/v1/products/public/search?page=${page}&limit=${limit}`;

      // Nếu có categoryId, thêm vào URL
      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      let fetchedProducts = data.data || [];

      // Lọc sản phẩm theo giá price (client-side)
      if (sortBy === "price_asc") {
        // Sắp xếp từ thấp đến cao
        fetchedProducts = [...fetchedProducts].sort(
            (a, b) => a.price - b.price
        );
        console.log(
            " Sắp xếp giá: Thấp → Cao",
            fetchedProducts.map((p) => p.price)
        );
      } else if (sortBy === "price_desc") {
        // Sắp xếp từ cao đến thấp
        fetchedProducts = [...fetchedProducts].sort(
            (a, b) => b.price - a.price
        );
        console.log(
            "Sắp xếp giá: Cao → Thấp",
            fetchedProducts.map((p) => p.price)
        );
      }

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
            <div className="product-info">Tìm thấy {total} sản phẩm</div>
            <select
                className="filter-select"
                value={sortBy}
                onChange={handleSortChange}
            >
              <option value="">Sắp xếp theo</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
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
                {products.map((item) => (
                    <div
                        className="product__item"
                        key={item.id}
                        onClick={() => handleProductClick(item.id)}
                        style={{ cursor: "pointer" }}
                    >
                      <img
                          src={`http://localhost:8090${item.thumbnail}`}
                          alt={item.name}
                          crossOrigin="anonymous"
                          style={{ cursor: "pointer" }}
                      />
                      <div className="product__category">{item.category_name}</div>

                      <h3 className="product__title">{item.name}</h3>

                      {item.display_price && item.display_price < item.price ? (
                          <>
                            <div className="product__price-new">
                              {item.display_price.toLocaleString("vi-VN")} đ
                            </div>
                            <div className="product__price-old">
                              {item.price.toLocaleString("vi-VN")} đ
                            </div>
                            {item.discount_badge && (
                                <div className="product__badge">
                                  {item.discount_badge}
                                </div>
                            )}
                          </>
                      ) : (
                          <>
                            <div className="product__price-new">
                              {item.price.toLocaleString("vi-VN")} đ
                            </div>

                            {/* placeholder để giữ chiều cao */}
                            <div className="product__price-old placeholder"> </div>
                          </>
                      )}

                      <button className="btn-cart">Thêm vào giỏ</button>
                    </div>
                ))}
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
