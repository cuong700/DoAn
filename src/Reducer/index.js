

import { combineReducers } from 'redux'; // Import thêm combineReducers
import cartReducer from './cart'; // Điều chỉnh đường dẫn nếu cần
import Checkstatus from './status'; 


const allReducer = combineReducers({
  cartReducer, Checkstatus

});




export default allReducer;
