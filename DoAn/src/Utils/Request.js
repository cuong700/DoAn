// Request.js
const API_DOMAIN = "http://localhost:8090/";

// GET request function
export const get = async ( path) => {
  const response = await fetch(API_DOMAIN + path);
  const result = await response.json();
  return result;
};



export const post = async (path,id) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(id),
  });

  const result = await response.json();
  return result;
};



// DELETE request function
export const del = async (path) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "DELETE",
  });
  const result = await response.json();
  return result;
};



// PATCH request function
export const patch = async (path, options) => {
  const response = await fetch(API_DOMAIN + path, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });
  const result = await response.json();
  return result;
};





