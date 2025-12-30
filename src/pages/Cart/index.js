// import { useEffect, useState } from "react";
// import "./Cart.css";
// import { Plus, Minus, Trash2, Tag, ShoppingBag } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { getCookie } from "../../helpers/cookie";
// import axios from "axios";
// import { ShoppingCartOutlined } from "@ant-design/icons";

// function Cart() {
//   const navigate = useNavigate();

//   const [cartItems, setCartItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [couponCode, setCouponCode] = useState("");
//   const [discount, setDiscount] = useState(0);
//   const [couponError, setCouponError] = useState(null);
//   const [availableCoupons, setAvailableCoupons] = useState([]);
//   const [verifyData, setVerifyData] = useState(null);
//   const [verifyError, setVerifyError] = useState(null);
//   const [loadingCheckout, setLoadingCheckout] = useState(false);

//   const userId = getCookie("userid");
//   const token = getCookie("token");

//   const formatPrice = (value) => Number(value || 0).toLocaleString("vi-VN");

//   // Tính toán dựa trên sản phẩm được chọn
//   const selectedCartItems = cartItems.filter((item) =>
//     selectedItems.includes(item.id)
//   );

//   const subtotal = selectedCartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0
//   );

//   const total = Math.max(subtotal - discount, 0);

//   // Kiểm tra đã chọn tất cả chưa
//   const isAllSelected =
//     cartItems.length > 0 && selectedItems.length === cartItems.length;

//   // LOAD CART
//   useEffect(() => {
//     const loadCart = () => {
//       const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
//       setCartItems(savedCart);

//       // setSelectedItems(savedCart.map(item => item.id));
//     };

//     loadCart();

//     window.addEventListener("cartUpdated", loadCart);

//     return () => {
//       window.removeEventListener("cartUpdated", loadCart);
//     };
//   }, []);

//   // LOAD AVAILABLE COUPONS - chỉ cho sản phẩm được chọn
//   useEffect(() => {
//     if (selectedCartItems.length === 0) {
//       setAvailableCoupons([]);
//       setDiscount(0);
//       setCouponCode("");
//       return;
//     }

//     axios
//       .post("http://localhost:8090/api/v1/coupons/user/available", {
//         items: selectedCartItems.map((item) => ({
//           product_id: item.product_id ?? item.id,
//           quantity: item.quantity,
//           ...(item.size_id && { size_id: item.size_id }),
//         })),
//       })
//       .then((res) => {
//         const coupons = res.data?.data?.availableCoupons || [];
//         setAvailableCoupons(coupons);
//       })
//       .catch(() => {
//         setAvailableCoupons([]);
//       });
//   }, [selectedItems, cartItems]);

//   // VERIFY CART - chỉ verify sản phẩm được chọn
//   const verifyCart = async () => {
//     if (selectedCartItems.length === 0) {
//       setVerifyData(null);
//       setVerifyError(null);
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:8090/api/v1/cart/public/verify",
//         {
//           items: selectedCartItems.map((item) => ({
//             product_id: item.product_id ?? item.id,
//             quantity: item.quantity,
//             ...(item.size_id && { size_id: item.size_id }),
//           })),
//         }
//       );

//       setVerifyData(res.data);
//       setVerifyError(null);
//     } catch {
//       setVerifyError("Không thể xác thực giỏ hàng");
//       setVerifyData(null);
//     }
//   };

//   // AUTO VERIFY (debounce)
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       verifyCart();
//     }, 300);

//     return () => clearTimeout(timer);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedItems, cartItems]);

//   // CHỌN/BỎ CHỌN TẤT CẢ
//   const handleSelectAll = () => {
//     if (isAllSelected) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(cartItems.map((item) => item.id));
//     }
//   };

//   // CHỌN/BỎ CHỌN 1 SẢN PHẨM
//   const handleSelectItem = (id) => {
//     if (selectedItems.includes(id)) {
//       setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
//     } else {
//       setSelectedItems([...selectedItems, id]);
//     }
//   };

//   const handleIncreaseQuantity = (id) => {
//     const updated = cartItems.map((item) =>
//       item.id === id ? { ...item, quantity: item.quantity + 1 } : item
//     );

//     setCartItems(updated);
//     localStorage.setItem("cart", JSON.stringify(updated));
//     window.dispatchEvent(new Event("cartUpdated"));
//   };

//   const handleDecreaseQuantity = (id) => {
//     const updated = cartItems.map((item) =>
//       item.id === id && item.quantity > 1
//         ? { ...item, quantity: item.quantity - 1 }
//         : item
//     );

//     setCartItems(updated);
//     localStorage.setItem("cart", JSON.stringify(updated));
//     window.dispatchEvent(new Event("cartUpdated"));
//   };

//   const handleRemoveItem = (id) => {
//     const updated = cartItems.filter((item) => item.id !== id);

//     setCartItems(updated);
//     setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
//     localStorage.setItem("cart", JSON.stringify(updated));
//     window.dispatchEvent(new Event("cartUpdated"));
//   };

//   const handleApplyCoupon = async () => {
//     if (!couponCode) {
//       setCouponError("Vui lòng nhập mã giảm giá");
//       return;
//     }

//     if (selectedCartItems.length === 0) {
//       setCouponError("Vui lòng chọn sản phẩm trước khi áp dụng mã");
//       return;
//     }

//     const isAvailable = availableCoupons.some((c) => c.code === couponCode);

//     if (!isAvailable) {
//       setCouponError("Mã giảm giá không áp dụng cho các sản phẩm đã chọn");
//       return;
//     }

//     try {
//       const res = await axios.post(
//         "http://localhost:8090/coupons/user/calculate",
//         {
//           user_id: Number(userId),
//           coupon_codes: [couponCode],
//           items: selectedCartItems.map((item) => ({
//             product_id: item.product_id ?? item.id,
//             quantity: item.quantity,
//             ...(item.size_id && { size_id: item.size_id }),
//           })),
//         }
//       );

//       setDiscount(res.data?.data?.discountValue || 0);
//       setCouponError(null);
//     } catch {
//       setDiscount(0);
//       setCouponError("Không thể áp dụng mã giảm giá");
//     }
//   };

//   // MUA HÀNG - GỌI API TẠO ĐƠN HÀNG
//   const handleCheckout = async () => {
//     if (!token) {
//       alert("Vui lòng đăng nhập để mua hàng");
//       navigate("/login");
//       return;
//     }

//     if (selectedCartItems.length === 0) {
//       alert("Vui lòng chọn ít nhất 1 sản phẩm để mua");
//       return;
//     }

//     setLoadingCheckout(true);

//     try {
//       // Tạo OrderDTO theo format backend yêu cầu
//       const orderDTO = {
//         userId: Number(userId),
//         fullName: "", // User sẽ nhập ở trang checkout
//         email: "",
//         phoneNumber: "",
//         address: "",
//         note: "",
//         totalMoney: total,
//         shippingMethod: "express",
//         paymentMethod: "cod",
//         couponCodes: couponCode ? [couponCode] : [],
//         cartItems: selectedCartItems.map((item) => ({
//           productId: item.product_id ?? item.id,
//           quantity: item.quantity,
//           ...(item.size_id && { sizeId: item.size_id }),
//         })),
//       };

//       const response = await axios.post(
//         "http://localhost:8090/api/v1/orders/user/create",
//         orderDTO,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.data) {
//         // Xóa các sản phẩm đã mua khỏi giỏ hàng
//         const remainingItems = cartItems.filter(
//           (item) => !selectedItems.includes(item.id)
//         );

//         setCartItems(remainingItems);
//         setSelectedItems([]);
//         localStorage.setItem("cart", JSON.stringify(remainingItems));
//         window.dispatchEvent(new Event("cartUpdated"));

//         alert("Đặt hàng thành công!");

//         // Chuyển đến trang đơn hàng
//         const orderId = response.data.data?.id;
//         if (orderId) {
//           navigate(`/orders/${orderId}`);
//         } else {
//           navigate("/orders");
//         }
//       }
//     } catch (error) {
//       console.error("Error creating order:", error);

//       let errorMessage = "Không thể đặt hàng. Vui lòng thử lại.";

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       }

//       alert(errorMessage);
//     } finally {
//       setLoadingCheckout(false);
//     }
//   };

//   return (
//     <div className="cart-container">
//       <div className="cart-wrapper">
//         <div className="cart-header">
//           <ShoppingCartOutlined className="cart-header-icon" />
//           <h1 className="cart-title">Giỏ Hàng</h1>
//         </div>

//         {cartItems.length === 0 ? (
//           <div className="empty-cart">
//             <ShoppingCartOutlined className="empty-cart-icon" />
//             <p>Giỏ hàng của bạn đang trống</p>
//             <button onClick={() => navigate("/products")}>
//               Tiếp tục mua sắm
//             </button>
//           </div>
//         ) : (
//           <div className="cart-grid">
//             <div className="cart-items">
//               {/* HEADER CHỌN TẤT CẢ */}
//               <div className="cart-select-all">
//                 <label className="checkbox-wrapper">
//                   <input
//                     type="checkbox"
//                     checked={isAllSelected}
//                     onChange={handleSelectAll}
//                   />
//                   <span className="checkbox-label">
//                     Chọn tất cả ({cartItems.length} sản phẩm)
//                   </span>
//                 </label>
//                 {selectedItems.length > 0 && (
//                   <button
//                     className="delete-selected-btn"
//                     onClick={() => {
//                       const remaining = cartItems.filter(
//                         (item) => !selectedItems.includes(item.id)
//                       );
//                       setCartItems(remaining);
//                       setSelectedItems([]);
//                       localStorage.setItem("cart", JSON.stringify(remaining));
//                       window.dispatchEvent(new Event("cartUpdated"));
//                     }}
//                   >
//                     <Trash2 size={16} />
//                     Xóa ({selectedItems.length})
//                   </button>
//                 )}
//               </div>

//               {/* DANH SÁCH SẢN PHẨM */}
//               {cartItems.map((item) => (
//                 <div
//                   key={item.id}
//                   className={`cart-item ${
//                     selectedItems.includes(item.id) ? "selected" : ""
//                   }`}
//                 >
//                   <label className="checkbox-wrapper">
//                     <input
//                       type="checkbox"
//                       checked={selectedItems.includes(item.id)}
//                       onChange={() => handleSelectItem(item.id)}
//                     />
//                   </label>

//                   <img
//                     src={`http://localhost:8090${item.product_thumbnail}`}
//                     alt={item.name}
//                     crossOrigin="anonymous"
//                     className="item-image"
//                   />

//                   <div className="item-details">
//                     <h3>{item.name}</h3>
//                     <p className="item-price">{formatPrice(item.price)} ₫</p>
//                     {item.size && (
//                       <p className="item-size">Size: {item.size}</p>
//                     )}
//                   </div>

//                   <div className="item-actions">
//                     <div className="quantity-controls">
//                       <button onClick={() => handleDecreaseQuantity(item.id)}>
//                         <Minus size={16} />
//                       </button>
//                       <span>{item.quantity}</span>
//                       <button onClick={() => handleIncreaseQuantity(item.id)}>
//                         <Plus size={16} />
//                       </button>
//                     </div>

//                     <div className="item-total">
//                       <span className="total-label">Thành tiền:</span>
//                       <span className="total-price">
//                         {formatPrice(item.price * item.quantity)} ₫
//                       </span>
//                     </div>

//                     <button
//                       className="remove-btn"
//                       onClick={() => handleRemoveItem(item.id)}
//                       title="Xóa"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="cart-summary">
//               <h2>Tóm tắt đơn hàng</h2>

//               <div className="selected-info">
//                 <p>Đã chọn {selectedItems.length} sản phẩm</p>
//               </div>

//               <div className="coupon-section">
//                 <div className="coupon-input-wrapper">
//                   <Tag size={18} />
//                   <input
//                     type="text"
//                     placeholder="Nhập mã giảm giá"
//                     value={couponCode}
//                     onChange={(e) => setCouponCode(e.target.value)}
//                     disabled={selectedItems.length === 0}
//                   />
//                   <button
//                     onClick={handleApplyCoupon}
//                     disabled={selectedItems.length === 0}
//                   >
//                     Áp dụng
//                   </button>
//                 </div>

//                 {couponError && <p className="error-text">{couponError}</p>}

//                 {availableCoupons.length > 0 && (
//                   <div className="available-coupons">
//                     <p>Mã khả dụng:</p>
//                     {availableCoupons.map((coupon) => (
//                       <button
//                         key={coupon.code}
//                         className="coupon-badge"
//                         onClick={() => setCouponCode(coupon.code)}
//                       >
//                         {coupon.code}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="summary-row">
//                 <span>Tạm tính:</span>
//                 <span>{formatPrice(subtotal)} ₫</span>
//               </div>

//               {discount > 0 && (
//                 <div className="summary-row discount">
//                   <span>Giảm giá:</span>
//                   <span>-{formatPrice(discount)} ₫</span>
//                 </div>
//               )}

//               <div className="summary-row total">
//                 <span>Tổng cộng:</span>
//                 <span>{formatPrice(total)} ₫</span>
//               </div>

//               {verifyError && <p className="error-text">{verifyError}</p>}

//               <button
//                 className="checkout-btn"
//                 onClick={handleCheckout}
//                 disabled={loadingCheckout || selectedItems.length === 0}
//               >
//                 <ShoppingBag size={18} />
//                 {loadingCheckout
//                   ? "Đang xử lý..."
//                   : `Mua hàng (${selectedItems.length})`}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Cart;


import { useEffect, useState } from "react";
import "./Cart.css";
import { Plus, Minus, Trash2, Tag, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../helpers/cookie";
import axios from "axios";
import { ShoppingCartOutlined } from "@ant-design/icons";

function Cart() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState({
    valid: [],
    invalid: [],
  });
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [verifyData, setVerifyData] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const userId = getCookie("userid");
  const token = getCookie("token");

  const formatPrice = (value) => Number(value || 0).toLocaleString("vi-VN");

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = Math.max(subtotal - discount, 0);

  const isAllSelected =
    cartItems.length > 0 && selectedItems.length === cartItems.length;

  // LOAD CART
  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      console.log("Loaded cart:", savedCart); // Debug
      setCartItems(savedCart);
    };

    loadCart();
    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  // LOAD AVAILABLE COUPONS - chỉ khi mở modal
  const fetchAvailableCoupons = async () => {
    if (selectedCartItems.length === 0) {
      setAvailableCoupons({ valid: [], invalid: [] });
      return;
    }

    setLoadingCoupons(true);
    
    // Map đúng cấu trúc dữ liệu
    const items = selectedCartItems.map((item) => {
      const payload = {
        product_id: item.product_id,
        quantity: item.quantity,
      };
      
      // Chỉ thêm size_id nếu có
      if (item.size_id) {
        payload.size_id = item.size_id;
      }
      
      return payload;
    });

    console.log("Sending items to API:", items); // Debug

    try {
      const res = await axios.post(
        "http://localhost:8090/api/v1/coupons/user/available",
        { items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", res.data); // Debug

      const coupons = res.data?.data || { valid: [], invalid: [] };
      setAvailableCoupons(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setAvailableCoupons({ valid: [], invalid: [] });
    } finally {
      setLoadingCoupons(false);
    }
  };

  // VERIFY CART
  const verifyCart = async () => {
    if (selectedCartItems.length === 0) {
      setVerifyData(null);
      setVerifyError(null);
      return;
    }

    try {
      const items = selectedCartItems.map((item) => {
        const payload = {
          product_id: item.product_id,
          quantity: item.quantity,
        };
        
        if (item.size_id) {
          payload.size_id = item.size_id;
        }
        
        return payload;
      });

      const res = await axios.post(
        "http://localhost:8090/api/v1/cart/public/verify",
        { items }
      );

      setVerifyData(res.data);
      setVerifyError(null);
    } catch {
      setVerifyError("Không thể xác thực giỏ hàng");
      setVerifyData(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      verifyCart();
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedItems, cartItems]);

  // TÍnh discount khi có coupon được chọn
  useEffect(() => {
    if (selectedCoupons.length === 0 || selectedCartItems.length === 0) {
      setDiscount(0);
      return;
    }

    calculateDiscount();
  }, [selectedCoupons, selectedCartItems]);

  const calculateDiscount = async () => {
    try {
      const items = selectedCartItems.map((item) => {
        const payload = {
          product_id: item.product_id,
          quantity: item.quantity,
        };
        
        if (item.size_id) {
          payload.size_id = item.size_id;
        }
        
        return payload;
      });

      const res = await axios.post(
        "http://localhost:8090/api/v1/coupons/user/calculate",
        {
          user_id: Number(userId),
          coupon_codes: selectedCoupons,
          items: items,
        }
      );

      setDiscount(res.data?.data?.discountValue || 0);
    } catch (error) {
      console.error("Error calculating discount:", error);
      setDiscount(0);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const updateCart = (updated) => {
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleIncreaseQuantity = (id) => {
    updateCart(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecreaseQuantity = (id) => {
    updateCart(
      cartItems.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    const updated = cartItems.filter((item) => item.id !== id);
    setCartItems(updated);
    setSelectedItems(selectedItems.filter((itemId) => itemId !== id));
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleOpenCouponModal = () => {
    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn sản phẩm trước");
      return;
    }
    
    if (!token) {
      alert("Vui lòng đăng nhập để xem mã giảm giá");
      navigate("/login");
      return;
    }
    
    fetchAvailableCoupons();
    setShowCouponModal(true);
  };

  const handleApplyCoupons = (couponCodes) => {
    setSelectedCoupons(couponCodes);
  };

  const handleRemoveCoupon = (code) => {
    setSelectedCoupons(selectedCoupons.filter((c) => c !== code));
  };

  const handleCheckout = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập để mua hàng");
      navigate("/login");
      return;
    }

    if (selectedCartItems.length === 0) {
      alert("Vui lòng chọn ít nhất 1 sản phẩm");
      return;
    }

    setLoadingCheckout(true);

    try {
      const cartItemsPayload = selectedCartItems.map((item) => {
        const payload = {
          productId: item.product_id,
          quantity: item.quantity,
        };
        
        if (item.size_id) {
          payload.sizeId = item.size_id;
        }
        
        return payload;
      });

      const orderDTO = {
        userId: Number(userId),
        totalMoney: total,
        paymentMethod: "cod",
        shippingMethod: "express",
        couponCodes: selectedCoupons,
        cartItems: cartItemsPayload,
      };

      const res = await axios.post(
        "http://localhost:8090/api/v1/orders/user/create",
        orderDTO,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const remaining = cartItems.filter(
        (item) => !selectedItems.includes(item.id)
      );

      updateCart(remaining);
      setSelectedItems([]);
      setSelectedCoupons([]);

      alert("Đặt hàng thành công!");
      navigate(`/orders/${res.data.data.id}`);
    } catch (err) {
      console.error("Checkout error:", err);
      alert(err.response?.data?.message || "Không thể đặt hàng");
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div className="cart-container">
      <div className="cart-wrapper">
        <div className="cart-header">
          <ShoppingCartOutlined className="cart-header-icon" />
          <h1 className="cart-title">Giỏ Hàng</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCartOutlined className="empty-cart-icon" />
            <p>Giỏ hàng của bạn đang trống</p>
            <button onClick={() => navigate("/products")}>
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items">
              <div className="cart-select-all">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                  <span className="checkbox-label">
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <button
                    className="delete-selected-btn"
                    onClick={() => {
                      const remaining = cartItems.filter(
                        (item) => !selectedItems.includes(item.id)
                      );
                      setCartItems(remaining);
                      setSelectedItems([]);
                      localStorage.setItem("cart", JSON.stringify(remaining));
                      window.dispatchEvent(new Event("cartUpdated"));
                    }}
                  >
                    <Trash2 size={16} />
                    Xóa ({selectedItems.length})
                  </button>
                )}
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className={`cart-item ${
                    selectedItems.includes(item.id) ? "selected" : ""
                  }`}
                >
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </label>

                  <img
                    src={`http://localhost:8090${item.product_thumbnail}`}
                    alt={item.name}
                    crossOrigin="anonymous"
                    className="item-image"
                  />

                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">{formatPrice(item.price)} ₫</p>
                    {item.size && (
                      <p className="item-size">Size: {item.size}</p>
                    )}
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleDecreaseQuantity(item.id)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncreaseQuantity(item.id)}>
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="item-total">
                      <span className="total-label">Thành tiền:</span>
                      <span className="total-price">
                        {formatPrice(item.price * item.quantity)} ₫
                      </span>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Tóm tắt đơn hàng</h2>

              <div className="selected-info">
                <p>Đã chọn {selectedItems.length} sản phẩm</p>
              </div>

              <div className="coupon-section">
                <button
                  className="select-coupon-btn"
                  onClick={handleOpenCouponModal}
                  disabled={selectedItems.length === 0}
                >
                  <Tag size={18} />
                  Chọn mã giảm giá
                  {availableCoupons.valid.length > 0 && (
                    <span className="coupon-count">
                      ({availableCoupons.valid.length})
                    </span>
                  )}
                </button>

                {selectedCoupons.length > 0 && (
                  <div className="selected-coupons">
                    <p>Mã đã chọn:</p>
                    {selectedCoupons.map((code) => {
                      const coupon = availableCoupons.valid.find(
                        (c) => c.code === code
                      );
                      return (
                        <div key={code} className="selected-coupon-item">
                          <span className="coupon-code-badge">{code}</span>
                          {coupon && (
                            <span className="coupon-desc">
                              {coupon.description}
                            </span>
                          )}
                          <button
                            className="remove-coupon-btn"
                            onClick={() => handleRemoveCoupon(code)}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)} ₫</span>
              </div>

              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(discount)} ₫</span>
                </div>
              )}

              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)} ₫</span>
              </div>

              {verifyError && <p className="error-text">{verifyError}</p>}

              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={loadingCheckout || selectedItems.length === 0}
              >
                <ShoppingBag size={18} />
                {loadingCheckout
                  ? "Đang xử lý..."
                  : `Mua hàng (${selectedItems.length})`}
              </button>
            </div>
          </div>
        )}
      </div>

      {showCouponModal && (
        <CouponSelectorModal
          availableCoupons={availableCoupons}
          selectedCoupons={selectedCoupons}
          loading={loadingCoupons}
          onApplyCoupons={handleApplyCoupons}
          onClose={() => setShowCouponModal(false)}
        />
      )}
    </div>
  );
}

// Component Modal chọn coupon
function CouponSelectorModal({
  availableCoupons,
  selectedCoupons,
  loading,
  onApplyCoupons,
  onClose,
}) {
  const [tempSelected, setTempSelected] = useState({
    global: null,
    products: {},
  });

  useEffect(() => {
    const globalCoupon = availableCoupons.valid.find(
      (c) => c.applyToAll && selectedCoupons.includes(c.code)
    );

    const productCoupons = {};
    selectedCoupons.forEach((code) => {
      const coupon = availableCoupons.valid.find(
        (c) => c.code === code && !c.applyToAll
      );
      if (coupon) {
        productCoupons[coupon.productId] = code;
      }
    });

    setTempSelected({
      global: globalCoupon?.code || null,
      products: productCoupons,
    });
  }, [selectedCoupons, availableCoupons]);

  const handleApplyCoupon = (coupon) => {
    if (coupon.applyToAll) {
      setTempSelected((prev) => ({
        ...prev,
        global: coupon.code,
      }));
    } else {
      setTempSelected((prev) => ({
        ...prev,
        products: {
          ...prev.products,
          [coupon.productId]: coupon.code,
        },
      }));
    }
  };

  const handleRemoveCoupon = (coupon) => {
    if (coupon.applyToAll) {
      setTempSelected((prev) => ({
        ...prev,
        global: null,
      }));
    } else {
      const newProducts = { ...tempSelected.products };
      delete newProducts[coupon.productId];
      setTempSelected((prev) => ({
        ...prev,
        products: newProducts,
      }));
    }
  };

  const isSelected = (coupon) => {
    if (coupon.applyToAll) {
      return tempSelected.global === coupon.code;
    }
    return tempSelected.products[coupon.productId] === coupon.code;
  };

  const canApply = (coupon) => {
    if (coupon.applyToAll) {
      return !tempSelected.global || tempSelected.global === coupon.code;
    }
    return (
      !tempSelected.products[coupon.productId] ||
      tempSelected.products[coupon.productId] === coupon.code
    );
  };

  const handleConfirm = () => {
    const couponCodes = [];

    if (tempSelected.global) {
      couponCodes.push(tempSelected.global);
    }

    Object.values(tempSelected.products).forEach((code) => {
      if (code) couponCodes.push(code);
    });

    onApplyCoupons(couponCodes);
    onClose();
  };

  const globalCoupons = availableCoupons.valid.filter((c) => c.applyToAll);
  const productCouponsMap = availableCoupons.valid
    .filter((c) => !c.applyToAll)
    .reduce((acc, coupon) => {
      const productId = coupon.productId;
      if (!acc[productId]) acc[productId] = [];
      acc[productId].push(coupon);
      return acc;
    }, {});

  return (
    <div className="coupon-modal-overlay" onClick={onClose}>
      <div
        className="coupon-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="coupon-modal-header">
          <h2>Chọn mã giảm giá</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="coupon-modal-body">
          {loading ? (
            <div className="loading">
              <p>Đang tải mã giảm giá...</p>
            </div>
          ) : (
            <>
              {globalCoupons.length > 0 && (
                <div className="coupon-section">
                  <h3>🎁 Mã giảm giá toàn đơn</h3>
                  <div className="coupon-list">
                    {globalCoupons.map((coupon) => (
                      <CouponItem
                        key={coupon.id}
                        coupon={coupon}
                        isSelected={isSelected(coupon)}
                        canApply={canApply(coupon)}
                        onApply={() => handleApplyCoupon(coupon)}
                        onRemove={() => handleRemoveCoupon(coupon)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {Object.entries(productCouponsMap).map(
                ([productId, coupons]) => (
                  <div key={productId} className="coupon-section">
                    <h3>🏷️ Mã cho: {coupons[0]?.productName}</h3>

                    <div className="coupon-list">
                      {coupons.map((coupon) => (
                        <CouponItem
                          key={coupon.id}
                          coupon={coupon}
                          isSelected={isSelected(coupon)}
                          canApply={canApply(coupon)}
                          onApply={() => handleApplyCoupon(coupon)}
                          onRemove={() => handleRemoveCoupon(coupon)}
                        />
                      ))}
                    </div>
                  </div>
                )
              )}

              {availableCoupons.valid.length === 0 && (
                <div className="no-coupons">
                  <p>Không có mã giảm giá khả dụng cho các sản phẩm đã chọn</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="coupon-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

function CouponItem({ coupon, isSelected, canApply, onApply, onRemove }) {
  return (
    <div className={`coupon-item ${isSelected ? "selected" : ""}`}>
      <div className="coupon-info">
        <div className="coupon-header-row">
          <span className="coupon-code">{coupon.code}</span>
          <span className="coupon-type-badge">{coupon.couponType}</span>
        </div>

        <h4 className="coupon-name">{coupon.name}</h4>

        <div className="coupon-discount">💰 {coupon.description}</div>

        <div className="coupon-scope">📌 {coupon.applicableScope}</div>
      </div>

      <div className="coupon-action">
        {canApply ? (
          isSelected ? (
            <button className="btn-remove" onClick={onRemove}>
              Bỏ chọn
            </button>
          ) : (
            <button className="btn-apply" onClick={onApply}>
              Áp dụng
            </button>
          )
        ) : (
          <span className="text-disabled">Không khả dụng</span>
        )}
      </div>
    </div>
  );
}

export default Cart;