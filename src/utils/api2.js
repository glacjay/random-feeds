import axios from 'axios';
import qs from 'qs';

let api = axios.create({
  baseURL: 'https://fever.glacjay.info',
  timeout: 30000,
  headers: {
    Accept: 'application/json; charset=UTF-8',
  },
});

const api2 = {};

api2.request = async (method, url, args, options) => {
  try {
    const actualArgs = {
      ...args,
    };
    const result = (
      await api[method](url, method === 'post' ? qs.stringify(actualArgs) : { params: actualArgs })
    ).data;
    if (options?.log !== false) {
      console.log(method.toUpperCase(), url, args, result);
    }
    if (!result?.auth) {
      throw new Error('auth failed');
    }
    return result;
  } catch (error) {
    console.warn(method.toUpperCase(), url, args, error);
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
