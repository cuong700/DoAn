import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Searchpage.css";

function Searchpage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const keyword = query.get("keyword")?.toLowerCase() || "";

  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8090/products/search?keyword=${keyword}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setResults(data);
        } else if (Array.isArray(data.data)) {
          setResults(data.data);
        } else {
          setResults([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setResults([]);
      });
  }, [keyword]);

  return (
    <div>
      <h2>Kết quả tìm kiếm cho: "{keyword}"</h2>

      {results.length === 0 && <p>Không tìm thấy sản phẩm.</p>}

      <div>
        {results.map((p) => (
          <div key={p.id}>
            <img src={p.image} alt="" />
            <p>Tên: {p.name}</p>
            <p>Màu: {p.color}</p>
            <p>Size: {p.size}</p>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Searchpage;
