// Addtocart function
export const Addtocart = (id, quantity) => {
    return {
      type: "ADDTOCART",
      id: id,
      quantity: quantity
    
    };
  };
  


export const Updatecart = (id, price ,quantity = 1) => {
  return {
    type: "UPDATECART",
    id: id,
    // info: info,
    quantity: quantity,
    price: price
  };
};


export const Deletecart = (id) => {
  return {
    type: "DELETECART",
    id: id,
  
  };
};








// export const Login = () => {

//   const LoginStatus = Cookies.set('isLogin', 'true', { expires: 1 }); 
//   return async (dispatch) => {
//     type: "CHECKSTATUS",
//     isLogin :  LoginStatus 
//   };
// };



//   const AddTocard = ( id , info )=>{

//   return {  
// type:"ADDTOCART",
// id:id,
// info:info

//   };};
  