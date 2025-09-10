import http from "@/assets/javascript/http";

export type User = {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
};

const getUserList = async (): Promise<User[]> => {
  const res = await http.get("/users");
  const payload = res?.data;
  return Array.isArray(payload?.data) ? payload.data : [];
};

export default {
  getUserList,
}
