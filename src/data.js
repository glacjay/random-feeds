import { useQuery } from 'react-query';

export function useToken() {
  const query = useQuery('token', () => localStorage.getItem('token'));
  return { ...query, token: query.data };
}
