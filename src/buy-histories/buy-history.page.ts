import http from "@/assets/javascript/http";
import { AxiosResponse } from "axios";

export type IBuyHistory = {
  id?: string;
  commodityId: string;
  date: Date;
  qty: number;
  totalPrice: number;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBuyHistoryView extends IBuyHistory {
  commodityName: string;
  commodityUnit: string;
}

const prefix = "/buy-histories";
const getBuyHistoryList = async (): Promise<IBuyHistoryView[]> => {
  try {
    const res = await http.get(`${prefix}`);
    const payload = res?.data;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    console.log("Error", error);
    return [];
  }
};

const saveBuyHistory = async (payload: IBuyHistory): Promise<AxiosResponse> => {
  try {
    const res = await http.post(`${prefix}`, payload);
    return res;
  } catch (error: any) {
    return error.response;
  }
}

const getOneBuyHistory = async (
  id: string
): Promise<IBuyHistoryView> => {
  try {
    const res = await http.get(`${prefix}/${id}`);
    const payload = res?.data;
    return payload?.data;
  } catch (error: any) {
    return error.response;
  }
}

const updateBuyHistory = async (payload: IBuyHistory): Promise<AxiosResponse> => {
  try {
    const res = await http.put(`${prefix}/${payload.id}`, payload);
    return res;
  } catch (error: any) {
    return error.response;
  }
}

export default {
  getBuyHistoryList,
  saveBuyHistory,
  getOneBuyHistory,
  updateBuyHistory,
}
