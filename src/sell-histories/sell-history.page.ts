import auth from '@/assets/javascript/auth';

export type ISellHistory = {
  id?: string;
  commodityId: string;
  date: Date;
  qty: number;
  totalPrice: number;
  memo?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

type StandardResponse<T> = {
  message: string;
  status: number;
  data: T;
  errors?: any;
};

const prefix = '/sell-histories';
const getSellHistoryList = async (): Promise<ISellHistory[]> => {
  const res = await auth.authRequest<StandardResponse<ISellHistory[]>>({
    method: 'get',
    url: prefix,
  });

  return Array.isArray(res.data) ? res.data : [];
};

const saveSellHistory = async (payload: ISellHistory): Promise<void> => {
  await auth.authRequest({
    method: 'post',
    url: prefix,
    data: payload,
  });
};

const getOneSellHistory = async (id: string): Promise<ISellHistory> => {
  const res = await auth.authRequest<StandardResponse<ISellHistory>>({
    method: 'get',
    url: `${prefix}/${id}`,
  });

  return res.data;
};

const updateSellHistory = async (payload: ISellHistory): Promise<void> => {
  if (!payload.id) throw new Error('Missing payload.id');

  await auth.authRequest({
    method: 'put',
    url: `${prefix}/${payload.id}`,
    data: payload,
  });
};

const deleteSellHistory = async (id: string): Promise<void> => {
  await auth.authRequest({
    method: 'delete',
    url: `${prefix}/${id}`,
  });
};

export default {
  getSellHistoryList,
  saveSellHistory,
  getOneSellHistory,
  updateSellHistory,
  deleteSellHistory,
};
