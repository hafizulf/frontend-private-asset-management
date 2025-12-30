import http from "@/assets/javascript/http";

export type ICommodity = {
  id?: string;
  name: string;
  unit: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const prefix = "/commodities";
const getCommodityActiveList = async (): Promise<ICommodity[]> => {
  try {
    const res = await http.get(`${prefix}/active`);
    const payload = res?.data;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    console.log("Error", error);
    return [];
  }
};

const getCommodity = async (): Promise<ICommodity[]> => {
  try {
    const res = await http.get(`${prefix}`);
    const payload = res?.data;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    console.log("Error", error);
    return [];
  }
};


export default {
  getCommodityActiveList,
  getCommodity,
}
