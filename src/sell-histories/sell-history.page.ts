import http from "@/assets/javascript/http";
import { AxiosError, AxiosResponse } from "axios";

export type ISellHistory = {
  id?: string;
  commodityId: string;
  date: Date;
  qty: number;
  totalPrice: number;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const prefix = "/sell-histories";
const getSellHistoryList = async (): Promise<AxiosResponse | []> => {
  try {
    const res = await http.get(`${prefix}`);
    const payload = res?.data;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    const err = error as AxiosError;
    return err.response as AxiosResponse;
  }
};

const saveSellHistory = async (payload: ISellHistory): Promise<AxiosResponse> => {
  try {
    const res = await http.post(`${prefix}`, payload);
    return res;
  } catch (error: any) {
    return error.response;
  }
}

const getOneSellHistory = async (id: string): Promise<AxiosResponse> => {
  try {
    const res = await http.get(`${prefix}/${id}`);
    const payload = res?.data;
    return payload?.data;
  } catch (error) {
    const err = error as AxiosError;
    return err.response as AxiosResponse;
  }
};

const updateSellHistory = async (payload: ISellHistory): Promise<AxiosResponse> => {
  try {
    const res = await http.put(`${prefix}/${payload.id}`, payload);
    return res;
  } catch (error: any) {
    return error.response;
  }
}

const deleteSellHistory = async (id: string): Promise<AxiosResponse> => {
  try {
    const res = await http.delete(`${prefix}/${id}`);
    return res;
  } catch (error: any) {
    return error.response;
  }
}

export default {
  getSellHistoryList,
  saveSellHistory,
  getOneSellHistory,
  updateSellHistory,
  deleteSellHistory,
}
