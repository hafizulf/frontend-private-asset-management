import auth from '@/assets/javascript/auth';

export type ICommodity = {
  id?: string;
  name: string;
  unit: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type StandardResponse<T> = {
  message: string;
  status: number;
  data: T;
  errors?: any;
};

const prefix = '/commodities';
const getCommodityActiveList = async (): Promise<ICommodity[]> => {
  const res = await auth.authRequest<StandardResponse<ICommodity[]>>({
    method: 'get',
    url: `${prefix}/active`,
  });

  return Array.isArray(res.data) ? res.data : [];
};

const getCommodity = async (): Promise<ICommodity[]> => {
  const res = await auth.authRequest<StandardResponse<ICommodity[]>>({
    method: 'get',
    url: prefix,
  });

  return Array.isArray(res.data) ? res.data : [];
};

const storeCommodity = async (payload: ICommodity): Promise<void> => {
  await auth.authRequest({
    method: 'post',
    url: prefix,
    data: payload,
  });
};

const deleteCommodity = async (id: string): Promise<void> => {
  await auth.authRequest({
    method: 'delete',
    url: `${prefix}/${id}`,
  });
};

const getOneCommodity = async (id: string): Promise<ICommodity> => {
  const res = await auth.authRequest<StandardResponse<ICommodity>>({
    method: 'get',
    url: `${prefix}/${id}`,
  });

  return res.data;
};

const updateCommodity = async (payload: ICommodity): Promise<void> => {
  if (!payload.id) throw new Error('Missing payload.id');

  await auth.authRequest({
    method: 'put',
    url: `${prefix}/${payload.id}`,
    data: payload,
  });
};

export default {
  getCommodityActiveList,
  getCommodity,
  storeCommodity,
  deleteCommodity,
  getOneCommodity,
  updateCommodity,
};
