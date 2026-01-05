import auth from '@/assets/javascript/auth';

export type User = {
  id: string;
  fullName: string;
  email: string;
  roleName: string;
};

type StandardResponse<T> = {
  message: string;
  status: number;
  data: T;
  errors?: any;
};

const getUserList = async (): Promise<User[]> => {
  const res = await auth.authRequest<StandardResponse<User[]>>({
    method: 'get',
    url: '/users',
  });

  return Array.isArray(res.data) ? res.data : [];
};

export default {
  getUserList,
};
