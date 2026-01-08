import auth from '@/assets/javascript/auth';

type StandardResponse<T> = {
  message: string;
  status: number;
  data: T;
  errors?: any;
};

export type ITotalTransactions = {
  totalPrice: string;
  totalTransactions: number;
};

export type ITotalProfitLoss = {
  totalProfitLoss: {
    value: string;
    trend: number;
  }
}

export type IStockAssetItem = {
  commodityId: string;
  commodityName: string;
  qty: string; // "5.00"
};

export type IStockAssetsResponse = {
  totalStockAssets: IStockAssetItem[];
};

const prefix = '/dashboard';
const getTotalBuyTransactions = async (queryParams?: string): Promise<ITotalTransactions> => {
  const res = await auth.authRequest<StandardResponse<ITotalTransactions>>({
    method: 'get',
    url: `${prefix}/buy-transactions${queryParams}`,
  });

  return res.data;
};

const getTotalSellTransactions = async (queryParams?: string): Promise<ITotalTransactions> => {
  const res = await auth.authRequest<StandardResponse<ITotalTransactions>>({
    method: 'get',
    url: `${prefix}/sell-transactions${queryParams}`,
  });

  return res.data;
};

const getTotalProfitLoss = async (queryParams?: string): Promise<ITotalProfitLoss> => {
  const res = await auth.authRequest<StandardResponse<ITotalProfitLoss>>({
    method: 'get',
    url: `${prefix}/profit-loss${queryParams}`,
  });

  return res.data;
}

const getStockAssets = async (queryParams?: string): Promise<IStockAssetsResponse> => {
  const res = await auth.authRequest<StandardResponse<IStockAssetsResponse>>({
    method: "get",
    url: `${prefix}/stock-assets${queryParams ?? ""}`,
  });

  return res.data;
};

export default {
  getTotalBuyTransactions,
  getTotalSellTransactions,
  getTotalProfitLoss,
  getStockAssets,
}
