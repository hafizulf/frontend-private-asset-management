import http from "@/assets/javascript/http";

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

const getBuyHistoryList = async (): Promise<any> => {
  try {
    const res = await http.get("/buy-histories");
    const payload = res?.data;
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch (error) {
    console.log("Error", error);
  }
};


export default {
  getBuyHistoryList,
}
