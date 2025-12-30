
import { get } from "../Utils/Request";

export const getListTopic = async () => {
  try {
    const result = await get("topics");
    return result;
  } catch (error) {
    console.error("Error occurred while fetching topic list:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};



export const getTopic = async (id) => {
  try {
    const result = await get(`topics?id=${id}`); // Sử dụng template literals
    return result;
  } catch (error) {
    console.error("Error occurred while fetching topic:", error);
    return []
  }
};



// export const getListQuestion = async (topicId) => {
//     try {
//       const result = await get(`questions?topicId=${topicId}`);
//       return result;
//     } catch (error) {
//       console.error("Error occurred while fetching questions:", error);
//       return []; // Trả về mảng rỗng nếu có lỗi
//     }
//   };
  