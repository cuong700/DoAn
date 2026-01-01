import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { deleteCookie,deleteAllCookies  } from "../../helpers/cookie"; 
import { useDispatch } from "react-redux";
import { checkLogin } from "../../actions/login";


function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    deleteAllCookies();
    dispatch(checkLogin(false));
    deleteCookie("isLogin");
    deleteCookie("token");
    
    // Xóa giỏ hàng khỏi localStorage
    localStorage.removeItem("cart");
    
    // Trigger event để Cart component cập nhật
    window.dispatchEvent(new Event("cartUpdated"));
    alert("Đăng xuất thành công");

    setTimeout(() => {
      navigate("/");
    }, 200);
  }, []);

  return <>Đang Logout</>;
}

export default Logout;
