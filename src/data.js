import { useQuery } from 'react-query';

export function useToken() {
  const query = useQuery('token', () => localStorage.getItem('token'));
  return { ...query, token: query.data };
}

export function useFolders() {
  const { token } = useToken();
  const result = useQuery('/reader/api/0/tag/list?output=json', {
    enabled: !!token,
    select: (data) => data.tags.filter((tag) => /\/label\//.test(tag.id)),
  });
  return { ...result, folders: result.data };
}

export function useFolderUnreadsCount(folder) {
  const { token } = useToken();
  const result = useQuery('/reader/api/0/unread-count?output=json', {
    enabled: !!token,
    select: (data) => {
      const folderId = folder.id?.replace(/\d+/, '-');
      const count = data.unreadcounts.find((c) => c.id === folderId);
      if (count) return count.count;
    },
  });
  return { ...result, unreadsCount: result.data };
}
