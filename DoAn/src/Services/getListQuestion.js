



import { get } from "../Utils/Request";

export const getListQuestion = async (topicId) => {
  try {
    const result = await get(`questions?topicId=${topicId}`);
    return result;
  } catch (error) {
    console.error("Error occurred while fetching questions:", error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
};
