import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL;

const isLoggedIn = async () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await axios.get(`${API}auths/getMe`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.status === 200;
  } catch (err: any) {
    console.log("Error auth/getMe >> ", err.response.data);

    return false;
  }
};

export default {
  isLoggedIn,
}