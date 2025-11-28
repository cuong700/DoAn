import { get ,post} from "../Utils/Request";

export const getProductList = async () => {
  const result = await get();
  return result;
};






export const addProductList = async (id) => {
  const result = await post( );
  return result;
};

