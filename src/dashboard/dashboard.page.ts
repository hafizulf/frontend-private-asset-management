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

export type IBuySellSeriesPoint = {
  bucket: string;
  buy: string;
  sell: string;
};

export type IBuySellSeriesResponse = {
  meta: {
    filter: string;
    from: string;
    to: string;
    granularity: "day" | "week" | "month";
    metric: "value" | "qty";
  };
  series: IBuySellSeriesPoint[];
  totals: {
    buy: string;
    sell: string;
  };
};

export type ITopCommodityItem = {
  commodityId: string;
  commodityName: string;
  buyQty: string;
  buyValue: string;
  sellQty: string;
  sellValue: string;
  totalQty: string;
  totalValue: string;
};

export type ITopCommoditiesResponse = {
  meta: {
    filter: string;
    from?: string;
    to?: string;
    metric: "value" | "qty";
    limit: number;
  };
  items: ITopCommodityItem[];
};

export interface IRecentTransactionRow {
  date: string;
  commodity: string;
  type: "BUY" | "SELL";
  qty: string;
  total: string;
  createdAt: string;
}

export type IRecentTransactionsResponse = IRecentTransactionRow[];

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

const getBuySellSeries = async (queryParams?: string): Promise<IBuySellSeriesResponse> => {
  const res = await auth.authRequest<StandardResponse<IBuySellSeriesResponse>>({
    method: "get",
    url: `${prefix}/buy-sell-series${queryParams ?? ""}`,
  });
  return res.data;
};

const getTopCommodities = async (queryParams?: string): Promise<ITopCommoditiesResponse> => {
  const res = await auth.authRequest<StandardResponse<ITopCommoditiesResponse>>({
    method: "get",
    url: `${prefix}/top-commodities${queryParams ?? ""}`,
  });

  return res.data;
};

const getRecentTransactions = async (): Promise<IRecentTransactionsResponse> => {
  const res = await auth.authRequest<StandardResponse<IRecentTransactionsResponse>>({
    method: "get",
    url: `${prefix}/recent-transactions`,
  });

  return res.data;
};

export default {
  getTotalBuyTransactions,
  getTotalSellTransactions,
  getTotalProfitLoss,
  getStockAssets,
  getBuySellSeries,
  getTopCommodities,
  getRecentTransactions,
}
