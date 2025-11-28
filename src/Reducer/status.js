const Checkstatus = (
  state = {
    Checking: [
      {
        check: false,
      },
    ],
  },
  action
) => {
  switch (action.type) {
    case "CHECKSTATUS":
      console.log("Reducer add:", action.check);
      return {
        Checking: [
          {
            check: action.check,
          },
        ],
      };
    default:
      return state; // Trả về trạng thái hiện tại nếu không có action nào khớp
  }
};

export default Checkstatus;

//   // action.js
// import Cookies from 'js-cookie';

// export const login = () => {
//   return async (dispatch) => {
//     // Thực hiện các thao tác đăng nhập ở đây

//     // Sau khi đăng nhập thành công, set cookie isLogin
//     Cookies.set('isLogin', 'true', { expires: 1 }); // Cookie hết hạn sau 1 ngày

//     // Dispatch action để cập nhật trạng thái đăng nhập trong Redux store
//     dispatch(checkLogin(true));
//   };
// };

// export const logout = () => {
//   return async (dispatch) => {
//     // Thực hiện các thao tác đăng xuất ở đây

//     // Xóa cookie isLogin khi đăng xuất
//     Cookies.remove('isLogin');

//     // Dispatch action để cập nhật trạng thái đăng nhập trong Redux store
//     dispatch(checkLogin(false));
//   };
// };
// Cập Nhật Reducer: Cập nhật reducer để cập nhật trạng thái đăng nhập trong Redux store dựa trên action được gửi từ action creator.
// javascript
// Sao chép mã
// // reducer.js
// const initialState = {
//   isLogin: false
// };

// const authReducer = (state = initialState, action) => {
//   switch (action.type) {
//     case 'CHECK_LOGIN':
//       return {
//         ...state,
//         isLogin: action.payload
//       };
//     default:
//       return state;
//   }
// };

// export default authReducer;
// Kết Nối Redux Store với Ứng Dụng React: Sử dụng useDispatch để gửi các action từ components React và sử dụng useSelector để đọc trạng thái từ Redux store.
// javascript
// Sao chép mã
// // Component React
// import { useDispatch, useSelector } from 'react-redux';
// import { login, logout } from './actions';

// const App = () => {
//   const dispatch = useDispatch();
//   const isLogin = useSelector((state) => state.auth.isLogin);

//   const handleLogin = () => {
//     dispatch(login());
//   };

//   const handleLogout = () => {
//     dispatch(logout());
//   };

//   return (
//     <div>
//       {isLogin ? (
//         <button onClick={handleLogout}>Đăng Xuất</button>
//       ) : (
//         <button onClick={handleLogin}>Đăng Nhập</button>
//       )}
//     </div>
//   );
// };

// export default App;
