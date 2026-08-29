import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const removeBackground = async (file, signal) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    `${API_URL}/remove-background`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      responseType: "blob",
      signal,
      timeout: 60000,
    }
  );

  return response.data;
};
