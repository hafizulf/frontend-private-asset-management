import http from "@/assets/javascript/http";

const getUserList = async () => {
  try {
    const data = await http.get("/users");

    return data.data;
  } catch (error) {
    console.error("Error fetching data userList(): ", error);
  }
}

export default {
  getUserList,
}
