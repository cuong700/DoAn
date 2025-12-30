import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { deleteCookie,deleteAllCookies  } from "../../helpers/cookie"; // Corrected import path
import { useDispatch } from "react-redux";
import { checkLogin } from "../../actions/login";
import { useSelector } from "react-redux";

function Logout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const check = useSelector((state) => state.cartReducer.cartItems);
  console.log(check[0]?.check);

  useEffect(() => {
    deleteAllCookies();
    dispatch(checkLogin(false));
    deleteCookie("isLogin");

    alert("Đã đăng xuát");

    setTimeout(() => {
      navigate("/");
    }, 200);
  }, []);

  return <>đang logout</>;
}

export default Logout;
