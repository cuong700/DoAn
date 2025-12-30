import { get ,post} from "../Utils/Request"; // Corrected import statement

export const login = async (email, password) => { // Corrected syntax
  try {
    const result = await get(`users?email=${email}&password=${password}`); // Corrected template literal syntax
    return result;
  } catch (error) {
    console.error("Error during login:", error);
    throw error; // Re-throwing the error for handling at a higher level if needed
  }

}
  export const register = async (options) => {
    try {
        const result = await post('users', options); // Gửi yêu cầu POST đến endpoint '/users' với các tùy chọn được truyền vào
        return result; // Trả về kết quả từ yêu cầu POST
    } catch (error) {
        console.error('Error during registration:', error);
        throw error; // Ném ra lỗi nếu có lỗi xảy ra
    }
};

// Hàm kiểm tra xem một giá trị đã tồn tại trong cơ sở dữ liệu hay chưa
export const checkExists = async (key, value) => {
    try {
        const result = await get(`users?${key}=${value}`); // Gửi yêu cầu GET đến endpoint '/users?key=value' để kiểm tra xem giá trị đã tồn tại hay chưa
        return result; // Trả về kết quả từ yêu cầu GET
    } catch (error) {
        console.error('Error during checking existence:', error);
        throw error; // Ném ra lỗi nếu có lỗi xảy ra
    }


};   