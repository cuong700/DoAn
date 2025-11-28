import { useEffect, useState } from "react";
import "./ProductList.css";
import { useNavigate, useParams } from "react-router-dom";

function ProductList({ onViewDetail }) {
   const { productId } = useParams();

   const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const skip = (page - 1) * limit;
    // http://localhost:8090/product/category/${productId}
    fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}`)
      .then(res => res.json())
      .then(data => {
        setProducts(data.products);
        setTotal(data.total);
      })
      .catch(err => console.error(err));
  }, [page]); //productId

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="product-container">
      <div className="product-toolbar">
        <h2 className="title">Danh sách sản phẩm</h2>
        <button className="btn-filter">Lọc sản phẩm</button>
      </div>

      <div className="product">
        {products.map((item) => (
          <div className="product__item" key={item.id}>
            <img src={item.thumbnail} alt={item.title} />
            <h3 className="product__title">{item.title}</h3>
            <div className="product__price-new">
              {((item.price * (100 - item.discountPercentage)) / 100).toFixed(2)}$
            </div>
            <div className="product__price-old">{item.price}$</div>

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

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={page === i + 1 ? "active" : ""}
            onClick={() => setPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}

        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default ProductList;
