import { useMemo } from 'react';
import { useQuery } from 'react-query';
import createPersistedState from 'use-persisted-state';

import api2 from './utils/api2';
import { useToast } from './utils/useToast';

const LOADING_COUNT = 7;

export const useToken = createPersistedState('token');
export const useRecentlyReadItems = createPersistedState('recentlyReadItems');
export function useLocalRandomItemsStore(folderId) {
  return useMemo(() => createPersistedState(`randomItems:${folderId}`), [folderId]);
}
export function useItemStore(itemId) {
  return useMemo(() => createPersistedState(`item:${itemId}`), [itemId]);
}

class MyLocalStorage {
  get(key) {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  }

  delete(key) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }

  set(key, value) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  }
}

export const lruStorage = new MyLocalStorage();

export function useFolders() {
  const [token] = useToken();
  const result = useQuery('/reader/api/0/tag/list?output=json', {
    enabled: !!token,
    select: (data) => data.tags.filter((tag) => /\/label\//.test(tag.id)),
  });
  useToast(result.error);
  return { ...result, folders: result.data };
}

function useAllUnreadCounts() {
  const [token] = useToken();
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

export function useFeedUnreadsCount(subscriptionId) {
  const { unreadCounts } = useAllUnreadCounts();
  return unreadCounts?.find((uc) => uc.id === subscriptionId)?.count;
}

function useAllSubscriptions() {
  const [token] = useToken();
  const result = useQuery('/reader/api/0/subscription/list?output=json', {
    enabled: !!token,
    select: (data) => data.subscriptions.sort((s1, s2) => s1.id.localeCompare(s2.id)),
  });
  return { ...result, allSubscriptions: result.data };
}

function useFolderSubscriptions(folderId) {
  const { unreadCounts } = useAllUnreadCounts();
  const { allSubscriptions } = useAllSubscriptions();
  return (allSubscriptions || []).filter(
    (sub) =>
      sub.categories?.some((cat) => cat.id === folderId) &&
      unreadCounts?.find((uc) => uc.id === sub.id)?.count > 0,
  );
}

export function useRandomItems({ folderId, isReloading }) {
  const subscriptions = useFolderSubscriptions(folderId);
  const { unreadCounts } = useAllUnreadCounts();

  const useLocalRandomItems = useLocalRandomItemsStore(folderId);
  const [localRandomItems, setLocalRandomItems] = useLocalRandomItems([]);

  const result = useQuery(
    [
      'randomItems',
      folderId,
      // deps
      { localRandomItems },
    ],
    async () => {
      if (localRandomItems.length > 2) return localRandomItems;

      const localItemFeeds = new Set(localRandomItems.map((item) => item.feedId));
      let subscriptionsCopy = subscriptions.filter((sub) => sub?.id && !localItemFeeds.has(sub.id));
      if (subscriptionsCopy.length < LOADING_COUNT) {
        subscriptionsCopy = subscriptions.filter((sub) => sub?.id);
      }

      const usedSubscriptions = [];
      for (
        let i = 0;
        usedSubscriptions.length < LOADING_COUNT && subscriptionsCopy.length > 0;
        i = (i + 1) % subscriptionsCopy.length
      ) {
        const subscription = subscriptionsCopy[i];
        const unreadCount = unreadCounts?.find((uc) => uc.id === subscription.id)?.count || 0;
        const probability =
          (Math.abs(Math.log(unreadCount + 1) / bottom(500, 12) - 4) + 1) /
          subscriptionsCopy.length;
        if (!usedSubscriptions.includes(subscription) && Math.random() < probability) {
          usedSubscriptions.push(subscription);
          subscriptionsCopy.splice(i, 1);
        }
      }

      const newItemsArray = await Promise.all(
        usedSubscriptions
          .filter((subscription) => subscription?.id)
          .map(async (subscription) => {
            const unreadCount = unreadCounts?.find((uc) => uc.id === subscription.id)?.count;
            const loadingCount = Math.ceil(unreadCount / LOADING_COUNT);
            const [oldestItems, newestItems] = await Promise.all(
              ['o', 'n'].map(
                async (r) =>
                  (
                    await api2.get('/reader/api/0/stream/items/ids', {
                      output: 'json',
                      s: subscription.id,
                      xt: 'user/-/state/com.google/read',
                      r,
                      n: loadingCount,
                    })
                  ).itemRefs,
              ),
            );
            return [...oldestItems, ...newestItems].map((item) => ({
              ...item,
              feedId: subscription.id,
            }));
          }),
      );

      const loadingItems = [];
      for (const newItems of newItemsArray) {
        const unreadCount = unreadCounts?.find((uc) => uc.id === newItems?.[0]?.feedId)?.count || 0;
        for (
          let i = 0;
          i < Math.log(unreadCount) / Math.log(bottom(450, 2)) && newItems.length > 0;
          i += 1
        ) {
          const index = Math.floor(Math.random() * newItems.length);
          const [newItem] = newItems.splice(index, 1);
          if (!loadingItems.some((item) => item.id === newItem.id)) {
            loadingItems.push(newItem);
            break;
          }
        }
      }

      const shuffledLoadingItems = [...loadingItems];
      for (let i = shuffledLoadingItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledLoadingItems[i], shuffledLoadingItems[j]] = [
          shuffledLoadingItems[j],
          shuffledLoadingItems[i],
        ];
      }

      const randomItems = [
        ...(isReloading ? [] : [...localRandomItems]),
        ...shuffledLoadingItems,
      ].filter((item, pos, self) => self.findIndex((item2) => item2.id === item.id) === pos);

      setLocalRandomItems(randomItems);
      return randomItems;
    },
    { enabled: subscriptions?.length > 0 },
  );
  return { ...result, randomItems: result.data };
}

/** log a(n) = b, calculate a */
function bottom(n, b) {
  return Math.pow(Math.E, Math.log(n) / b);
}

export function useItem(item) {
  const useItem = useItemStore(item.id);
  const [cachedItem, setCachedItem] = useItem();

  const enabled = !cachedItem && !item.crawlTimeMsec;
  const result = useQuery(`/reader/api/0/stream/items/contents?output=json&i=${item.id}`, {
    enabled,
    select: (data) => data.items[0],
  });

  const newItem =
    cachedItem ||
    (item.crawlTimeMsec
      ? item
      : {
          ...result.data,
          // There are two different item id formats:
          // - long number: from loading ids
          // - some sort of url path: from loading item detail
          // I'd prefer the former.
          id: item.id,
        });

  if (!cachedItem && newItem.crawlTimeMsec) {
    setCachedItem(newItem);

    if (localStorage.length > 222) {
      for (let i = 7; i >= 0; ) {
        const key = localStorage.key(Math.random() * localStorage.length);
        if (key?.startsWith('item:')) {
          console.log('xxx', { key });
          localStorage.removeItem(key);
          i--;
        }
      }
    }
  }

  return { ...result, item: newItem };
}
