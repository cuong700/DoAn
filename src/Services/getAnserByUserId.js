

import { get } from "../Utils/Request";
import { getCookie } from "../helpers/cokkie";

export const getAnswersByUserId = async () => {
  const userId = getCookie("id");
  const result = await get(`answers?userId=${userId}`);
  return result;
};


export const getAnswers = async (id) => {
    const result = await get(`answers?userId=${id}`);
    return result;
  };




export const getAnswerById = async (id) => {
    const result = await get(`answers?id=${id}`);
    return result;
  };