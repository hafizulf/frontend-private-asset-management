import http from "./http";

const isLoggedIn = async(): Promise<boolean> => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const res = await http.get("/auths/getMe");
    return res.status === 200;
  } catch {
    return false;
  }
}

export default { isLoggedIn };
