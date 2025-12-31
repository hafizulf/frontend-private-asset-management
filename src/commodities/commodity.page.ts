import http from "@/assets/javascript/http";
import { AxiosError, AxiosResponse } from "axios";

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

const storeCommodity = async (payload: ICommodity): Promise<AxiosResponse> => {
  try {
    const res = await http.post(`${prefix}`, payload);
    return res;
  } catch (error) {
    const err = error as AxiosError;
    return err.response as AxiosResponse;
  }
}

const deleteCommodity = async (id: string): Promise<AxiosResponse> => {
  try {
    const res = await http.delete(`${prefix}/${id}`);
    return res;
  } catch (error) {
    const err = error as AxiosError;
    return err.response as AxiosResponse;
  }
}

const getOneCommodity = async (id: string): Promise<AxiosResponse> => {
  try {
    const res = await http.get(`${prefix}/${id}`);
    const payload = res?.data;
    return payload?.data;
  } catch (error) {
    const err = error as AxiosError;
    return err.response as AxiosResponse;
  }
}

const updateCommodity = async (payload: ICommodity): Promise<AxiosResponse> => {
  try {
    const res = await http.put(`${prefix}/${payload.id}`, payload);
    return res;
  } catch (error) {
    const err = error as AxiosError;
    return err.response as AxiosResponse;
  }
}


export default {
  getCommodityActiveList,
  getCommodity,
  storeCommodity,
  deleteCommodity,
  getOneCommodity,
  updateCommodity
}
