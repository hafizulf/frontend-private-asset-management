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

export default {
  getSellHistoryList,
}