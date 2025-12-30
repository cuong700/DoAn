import { get ,post} from "../Utils/Request";
export const createAswers = async (e) => {

    const result = await post('answers', e);
    return result;
};


