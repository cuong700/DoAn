// import { useEffect, useState } from "react";
// import "./ProductList.css";
// import { useNavigate, useParams } from "react-router-dom";

// function ProductList({ onViewDetail }) {
//    const { productId } = useParams();

//    const navigate = useNavigate();
//   const [products, setProducts] = useState([]);
//   const [page, setPage] = useState(1);
//   const limit = 20;
//   const [total, setTotal] = useState(0);

//   useEffect(() => {
//     const skip = (page - 1) * limit;
//     // http://localhost:8090/product/category/${productId}
//     fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`)
//       .then(res => res.json())
//       .then(data => {
//         setProducts(data.products);
//         setTotal(data.total);
//       })
//       .catch(err => console.error(err));
//   }, [page]); //productId

//   const totalPages = Math.ceil(total / limit);

//   return (
//     <div className="product-container">
//       <div className="product-toolbar">
//         <h2 className="title">Danh sách sản phẩm</h2>
//         <button className="btn-filter">Lọc sản phẩm</button>
//       </div>

//       <div className="product">
//         {products.map((item) => (
//           <div className="product__item" key={item.id}>
//             <img src={item.thumbnail} alt={item.title} />
//             <h3 className="product__title">{item.title}</h3>
//             <div className="product__price-new">
//               {((item.price * (100 - item.discountPercentage)) / 100).toFixed(2)}$
//             </div>
//             <div className="product__price-old">{item.price}$</div>

//             <button
//               className="btn-detail"
//               onClick={() => navigate(`/product/${item.id}`)}
//             >
//               Xem chi tiết
//             </button>

//             <button className="btn-cart">Thêm vào giỏ</button>
//           </div>
//         ))}
//       </div>

//       <div className="pagination">
//         <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//           Prev
//         </button>

//         {[...Array(totalPages)].map((_, i) => (
//           <button
//             key={i}
//             className={page === i + 1 ? "active" : ""}
//             onClick={() => setPage(i + 1)}
//           >
//             {i + 1}
//           </button>
//         ))}

//         <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ProductList;

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

  // Lấy page từ URL, mặc định là 1 (trang 1)
  // Backend dùng 0-indexed nên phải trừ 1
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

      console.log("✅ Products data:", data);

      setProducts(data.data || []);
      setTotal(data.total_elements || 0);
      
      // Lấy tên danh mục từ sản phẩm đầu tiên
      if (data.data && data.data.length > 0) {
        setCategoryName(data.data[0].category_name);
      }
    } catch (err) {
      console.error("❌ Fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Reset page về 1 khi categoryId thay đổi
  useEffect(() => {
    // Xóa query param (mặc định về trang 1)
    setSearchParams({});
  }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId]);

  const totalPages = Math.ceil(total / limit);

  // Hàm thay đổi trang
  const handlePageChange = (newPageIndex) => {
    const displayPage = newPageIndex + 1; // Chuyển từ 0-indexed sang 1-indexed
    
    if (displayPage === 1) {
      // Trang 1: xóa query param
      setSearchParams({});
    } else {
      // Trang 2+: hiển thị page
      setSearchParams({ page: displayPage.toString() });
    }
  };

  return (
    <div className="product-container">
      <div className="product-toolbar">
        <h2 className="title">
          {categoryName || (categoryId ? "Sản phẩm theo danh mục" : "Danh sách sản phẩm")}
        </h2>
        <div className="product-info">Tìm thấy {total} sản phẩm</div>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="no-products">Không tìm thấy sản phẩm nào</div>
      ) : (
        <>
          <div className="product">
            {products.map((item) => (
              <div className="product__item" key={item.id}>
                <img
                  src={`http://localhost:8090${item.thumbnail}`}
                  alt={item.name}
                 
                />
                <h3 className="product__title">{item.name}</h3>
                
                {/* 
                  Logic đúng:
                  - price: giá bán thực tế (giá sau giảm)
                  - display_price: giá gốc (giá trước giảm)
                  - Nếu có display_price và display_price > price => đang giảm giá
                */}
                {item.display_price && item.display_price > item.price ? (
                  <>
                    <div className="product__price-new">
                      {item.price.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="product__price-old">
                      {item.display_price.toLocaleString("vi-VN")} đ
                    </div>
                  </>
                ) : (
                  <div className="product__price-new">
                    {item.price.toLocaleString("vi-VN")} đ
                  </div>
                )}

                <div className="product__category">{item.category_name}</div>

                <button
                  className="btn-detail"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  Xem chi tiết
                </button>

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