import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const analyzeCode = async (code) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, { code });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};