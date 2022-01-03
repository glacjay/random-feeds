import { useQuery } from 'react-query';

import api2 from './utils/api2';

const LOADING_COUNT = 7;

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

function useAllUnreadCounts() {
  const { token } = useToken();
  const result = useQuery('/reader/api/0/unread-count?output=json', {
    enabled: !!token,
    select: (data) => data.unreadcounts,
  });
  return { ...result, unreadCounts: result.data };
}

export function useFolderUnreadsCount(folder) {
  const folderId = folder.id?.replace(/\d+/, '-');
  const result = useAllUnreadCounts();
  return { ...result, unreadsCount: result.unreadCounts?.find((uc) => uc.id === folderId)?.count };
}

function useAllSubscriptions() {
  const { token } = useToken();
  const result = useQuery('/reader/api/0/subscription/list?output=json', {
    enabled: !!token,
    select: (data) => data.subscriptions,
  });
  return { ...result, allSubscriptions: result.data };
}

function useFolderSubscriptions(folderId) {
  const { unreadCounts } = useAllUnreadCounts();
  const { allSubscriptions } = useAllSubscriptions();
  return allSubscriptions?.filter(
    (sub) =>
      sub.categories?.some((cat) => cat.id === folderId) &&
      unreadCounts?.find((uc) => uc.id === sub.id)?.count > 0,
  );
}

export function useRandomItems({ folderId, isReloading }) {
  const subscriptions = useFolderSubscriptions(folderId);
  const result = useQuery(
    ['randomItems', folderId],
    async () => {
      const localRandomItems = JSON.parse(localStorage.getItem(`randomItems:${folderId}`) || '[]');
      if (localRandomItems.length > Math.random() * LOADING_COUNT) return localRandomItems;

      for (let i = subscriptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [subscriptions[i], subscriptions[j]] = [subscriptions[j], subscriptions[i]];
      }

      let newItemsArray = await Promise.all(
        subscriptions.slice(0, LOADING_COUNT).map(
          async (subscription) =>
            (
              await api2.get('/reader/api/0/stream/items/ids', {
                output: 'json',
                s: subscription.id,
                xt: 'user/-/state/com.google/read',
                r: 'o',
                n: LOADING_COUNT,
              })
            ).itemRefs,
        ),
      );

      const loadingItems = [];
      let addedCount = 0;
      while (newItemsArray.length > 0) {
        const newItems = newItemsArray.shift();
        if (newItems.length > 0) {
          const newItem = newItems.shift();
          if (!loadingItems.some((item) => item.id === newItem.id)) {
            loadingItems.push(newItem);
            addedCount += 1;
            if (addedCount >= 2 * LOADING_COUNT) break;
          }
          newItemsArray.push(newItems);
        }
      }

      const newRandomItems = await Promise.all(
        loadingItems.map(async (item) => ({
          ...(
            await api2.get(`/reader/api/0/stream/items/contents?output=json&i=${item.id}`)
          ).items[0],
          id: item.id,
        })),
      );

      const randomItems = [
        ...(isReloading ? [] : localRandomItems || []),
        ...newRandomItems,
      ].filter((item, pos, self) => self.findIndex((i2) => i2.id === item.id) === pos);

      localStorage.setItem(`randomItems:${folderId}`, JSON.stringify(randomItems));
      return randomItems;
    },
    { enabled: subscriptions?.length > 0 },
  );
  return { ...result, randomItems: result.data };
}
