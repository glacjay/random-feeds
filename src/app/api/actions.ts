'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import qs from 'qs';

import { FEVER_API_ENDPOINT } from '@/utils/api2';
import { setCookie } from '@/utils/cookies';
import { getToken, setToken } from '@/utils/token';

import { loadAllUnreadCounts, loadFolderSubscriptions } from './data';

const LOADING_COUNT = 7;

export async function login(formData: FormData) {
  const response = await fetch(`${FEVER_API_ENDPOINT}/accounts/ClientLogin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify({
      Email: formData.get('username'),
      Passwd: formData.get('password'),
    }),
    cache: 'no-store',
  });
  const result = await response.text();

  const json: { Auth?: string } = {};
  result
    .split('\n')
    .filter((l) => l)
    .forEach((line) => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        json[line.substr(0, idx)] = line.substr(idx + 1);
      } else {
        json[line] = true;
      }
    });

  if (!json.Auth) throw new Error('account or password incorrect');
  setToken(json.Auth);

  redirect('/');
}

export async function loadMoreRandomItems({
  folderId,
  isReloading = false,
}: {
  folderId: string;
  isReloading?: boolean;
}) {
  const token = getToken();

  const subscriptions = await loadFolderSubscriptions(folderId);
  const unreadCounts = await loadAllUnreadCounts();

  let cookieStore = await cookies();
  const localRandomItemIds = JSON.parse(
    cookieStore.get(`localRandomItemIds:${encodeURIComponent(folderId)}`)?.value || '[]',
  );
  const localRandomItems = await Promise.all(
    localRandomItemIds.map(async (itemId) => loadItem({ id: itemId })),
  );
  if (localRandomItemIds.length > LOADING_COUNT) return localRandomItems;

  const localItemFeedIdsSet = new Set(localRandomItems.map((item) => item.feedId));
  let subscriptionsCopy = subscriptions.filter(
    (sub) => sub?.id && !localItemFeedIdsSet.has(sub.id),
  );
  if (subscriptionsCopy.length < LOADING_COUNT) {
    subscriptionsCopy = subscriptions.filter((sub) => sub?.id);
  }

  const usedSubscriptions = [] as any[];
  for (
    let i = 0;
    usedSubscriptions.length < LOADING_COUNT && subscriptionsCopy.length > 0;
    i = (i + 1) % subscriptionsCopy.length
  ) {
    const subscription = subscriptionsCopy[i];
    const unreadCount = unreadCounts?.find((uc) => uc.id === subscription.id)?.count || 0;
    const probability =
      (Math.abs(Math.log(unreadCount + 1) / bottom(500, 12) - 4) + 1) / subscriptionsCopy.length;
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
          ['o', 'n'].map(async (r) => {
            const response = await fetch(
              `${FEVER_API_ENDPOINT}/reader/api/0/stream/items/ids?${qs.stringify({
                output: 'json',
                s: subscription.id,
                xt: 'user/-/state/com.google/read',
                r,
                n: loadingCount,
              })}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `GoogleLogin auth=${token}`,
                },
              },
            );
            const data = await response.json();
            return data.itemRefs;
          }),
        );
        return [...oldestItems, ...(newestItems || [])].map((item) => ({
          ...item,
          feedId: subscription.id,
        }));
      }),
  );

  const loadingItems = [] as any[];
  for (const newItems of newItemsArray) {
    const unreadCount = unreadCounts?.find((uc) => uc.id === newItems?.[0]?.feedId)?.count || 0;
    const loadingCount = Math.max(1, Math.floor(Math.log(unreadCount) / Math.log(bottom(400, 2))));
    for (let i = 0; i < loadingCount && newItems.length > 0; ) {
      const index = Math.floor(Math.random() * newItems.length);
      const [newItem] = newItems.splice(index, 1);
      if (!loadingItems.some((item) => item.id === newItem.id)) {
        loadingItems.push(newItem);
        i += 1;
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

  setCookie(
    `localRandomItemIds:${encodeURIComponent(folderId)}`,
    JSON.stringify(randomItems.map((item) => item.id)),
  );

  return randomItems;
}

function bottom(n, b) {
  return Math.pow(Math.E, Math.log(n) / b);
}

export async function loadItem(item) {
  if (item.crawlTimeMsec) return item;

  let token = getToken();
  let result = await fetch(
    `${FEVER_API_ENDPOINT}/reader/api/0/stream/items/contents?output=json&${qs.stringify({
      i: item.id,
    })}`,
    {
      headers: { Authorization: `GoogleLogin auth=${token}` },
    },
  );
  let json = await result.json();

  return {
    ...json.items[0],
    // There are two different item id formats:
    // - long number: from loading ids
    // - some sort of url path: from loading item detail
    // I'd prefer the former.
    id: item.id,
  };
}

export async function loadFeedUnreadsCount(subscriptionId) {
  let unreadCounts = await loadAllUnreadCounts();
  return unreadCounts?.find((uc) => uc.id === subscriptionId)?.count;
}

export async function removeItem(folderId, itemId) {
  let cookieStore = await cookies();
  let localRandomItemIds = JSON.parse(
    cookieStore.get(`localRandomItemIds:${encodeURIComponent(folderId)}`)?.value || '[]',
  );
  localRandomItemIds = localRandomItemIds.filter((id) => id !== itemId);
  setCookie(
    `localRandomItemIds:${encodeURIComponent(folderId)}`,
    JSON.stringify(localRandomItemIds),
  );
}

export async function markAsRead(folderId, itemId) {
  try {
    await fetch(
      `${FEVER_API_ENDPOINT}/reader/api/0/edit-tag?${qs.stringify({
        i: itemId,
        a: 'user/-/state/com.google/read',
      })}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `GoogleLogin auth=${getToken()}`,
        },
      },
    );

    let cookieStore = await cookies();
    let recentlyReadItemIds = JSON.parse(cookieStore.get('recentlyReadItemIds')?.value || '[]');
    recentlyReadItemIds = [itemId, ...recentlyReadItemIds]
      .reduce((acc, id) => (acc.includes(id) ? acc : [...acc, id]), [])
      .slice(0, 42);
    setCookie('recentlyReadItemIds', JSON.stringify(recentlyReadItemIds));

    removeItem(folderId, itemId);
  } catch (ex) {
    console.warn('ItemActions.markAsRead error:', ex);
    throw ex;
  }
}

export async function loadRecentlyReadItems() {
  let cookieStore = await cookies();
  let recentlyReadItemIds = JSON.parse(cookieStore.get('recentlyReadItemIds')?.value || '[]');
  return Promise.all(recentlyReadItemIds.map((id) => loadItem({ id })));
}
