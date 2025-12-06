import axios from "axios";

const API_URL = "http://localhost:8000";

export const analyzeCode = async (code, language) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, { code, language });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const sendFeedback = async (data) => {
  // data = { function_name, code, explanation, rating }
  try {
    await axios.post(`${API_URL}/feedback`, data);
  } catch (error) {
    console.error("Feedback Error:", error);
  }
};
