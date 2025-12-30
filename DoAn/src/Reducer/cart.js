const cartReducer = (state = { cartItems: [] }, action) => {
  switch (action.type) {
    
    case 'ADDTOCART':
      console.log("Reducer addtocard:", action.productId, action.quantity);
      return {
        ...state,
        cartItems: [...state.cartItems, { product_id: action.productId, quantity: action.quantity }]
      };
    default:
      return state; 
  }
};

export default cartReducer;
