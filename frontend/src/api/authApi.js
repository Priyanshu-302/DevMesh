import axiosClient from './axiosClient';

export const authApi = {
  signup: (payload) => axiosClient.post('/api/auth/signup', payload),
  login:  (payload) => axiosClient.post('/api/auth/login',  payload),
  logout: ()        => axiosClient.post('/api/auth/logout'),
  getProfile: ()        => axiosClient.get('/api/auth/profile'),
  updateProfile: (payload) => axiosClient.put('/api/auth/profile', payload),
};
