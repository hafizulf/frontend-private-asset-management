import auth from '@/assets/javascript/auth';

export type IBuyHistory = {
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

const prefix = '/buy-histories';
const getBuyHistoryList = async (): Promise<IBuyHistory[]> => {
  const res = await auth.authRequest<StandardResponse<IBuyHistory[]>>({
    method: 'get',
    url: prefix,
  });

  return Array.isArray(res.data) ? res.data : [];
};

const saveBuyHistory = async (payload: IBuyHistory): Promise<void> => {
  await auth.authRequest({
    method: 'post',
    url: prefix,
    data: payload,
  });
};

const getOneBuyHistory = async (id: string): Promise<IBuyHistory> => {
  const res = await auth.authRequest<StandardResponse<IBuyHistory>>({
    method: 'get',
    url: `${prefix}/${id}`,
  });

  return res.data;
};

const updateBuyHistory = async (payload: IBuyHistory): Promise<void> => {
  if (!payload.id) throw new Error('Missing payload.id');

  await auth.authRequest({
    method: 'put',
    url: `${prefix}/${payload.id}`,
    data: payload,
  });
};

const deleteBuyHistory = async (id: string): Promise<void> => {
  await auth.authRequest({
    method: 'delete',
    url: `${prefix}/${id}`,
  });
};

export default {
  getBuyHistoryList,
  saveBuyHistory,
  getOneBuyHistory,
  updateBuyHistory,
  deleteBuyHistory,
};
