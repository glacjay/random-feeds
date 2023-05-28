import axios from 'axios';
import qs from 'qs';

const api2 = {};

let api = axios.create({
  baseURL: 'https://damp-boat-612e.glacjay.workers.dev',
  timeout: 30000,
});

api2.request = async (method, url, args, options) => {
  try {
    const actualArgs = {
      ...args,
    };

    const token = JSON.parse(localStorage.getItem('token') || 'null');
    const headers = {
      ...(token ? { Authorization: `GoogleLogin auth=${token}` } : {}),
    };

    const result = (
      await api.request({
        method,
        url,
        ...(method === 'post' ? { data: qs.stringify(actualArgs) } : { params: actualArgs }),
        headers,
      })
    ).data;
    if (options?.log !== false) {
      console.log(method.toUpperCase(), url, args, result);
    }
    return result;
  } catch (error) {
    console.warn(method.toUpperCase(), url, args, error);
    if (error?.response?.status === 401) {
      window.location.href = `${api2.basePath || ''}/login`;
    }
    throw error;
  }
};

api2.get = async (url, args, options) => {
  return api2.request('get', url, args, options);
};
api2.post = async (url, args, options) => {
  return api2.request('post', url, args, options);
};

export default api2;
