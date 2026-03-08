import type { APIRoute } from 'astro';
import { getToken } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import { loadFolderSubscriptions, loadAllUnreadCounts, loadItem } from '@/lib/data';
import type { Subscription, Item } from '@/lib/types';

const LOADING_COUNT = 7;
const CACHE_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: import.meta.env.PROD,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
};

function bottom(n: number, b: number): number {
  return Math.pow(Math.E, Math.log(n) / b);
}

interface ItemRef {
  id: string;
  feedId?: string;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = getToken(cookies);
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { folderId, isReloading } = await request.json();
  if (!folderId) {
    return new Response('folderId is required', { status: 400 });
  }

  try {
    const [subscriptions, unreadCounts] = await Promise.all([
        loadFolderSubscriptions(token, folderId),
        loadAllUnreadCounts(token)
    ]);

    const cookieName = `localRandomItemIds:${encodeURIComponent(folderId)}`;
    const localRandomItemIds: Array<string | number> = JSON.parse(cookies.get(cookieName)?.value || '[]');

    const localRandomItems = await Promise.all(
      localRandomItemIds.map((itemId) => loadItem(token, { id: String(itemId) })),
    );

    if (!isReloading && localRandomItemIds.length > LOADING_COUNT) {
        return new Response(JSON.stringify(localRandomItems), { status: 200 });
    }

    const localItemFeedIdsSet = new Set(
      localRandomItems.map((item) => item.feedId || item.origin?.streamId).filter(Boolean),
    );
    let subscriptionsCopy = subscriptions.filter(
      (sub) => sub?.id && !localItemFeedIdsSet.has(sub.id),
    );
    if (subscriptionsCopy.length < LOADING_COUNT) {
        subscriptionsCopy = subscriptions.filter(sub => sub?.id);
    }
    
    const usedSubscriptions: Subscription[] = [];
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

    const newItemsArray: ItemRef[][] = await Promise.all(
      usedSubscriptions
        .filter((subscription) => subscription?.id)
        .map(async (subscription) => {
          const unreadCount = unreadCounts?.find((uc) => uc.id === subscription.id)?.count || 0;
          const loadingCount = Math.ceil(unreadCount / LOADING_COUNT);
          const [oldestItems, newestItems] = await Promise.all(
            ['o', 'n'].map(async (r) => {
              const data = await apiFetch('/reader/api/0/stream/items/ids', {
                token,
                queryParams: {
                  s: subscription.id,
                  xt: 'user/-/state/com.google/read',
                  r,
                  n: String(loadingCount),
                },
              });
              return (data.itemRefs || []) as ItemRef[];
            }),
          );
          return [...oldestItems, ...(newestItems || [])].map((item) => ({
            ...item,
            feedId: subscription.id,
          }));
        }),
    );

    const loadingItems: ItemRef[] = [];
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
        [shuffledLoadingItems[i], shuffledLoadingItems[j]] = [shuffledLoadingItems[j], shuffledLoadingItems[i]];
    }

    const finalItemRefs: ItemRef[] = [
      ...(isReloading
        ? []
        : localRandomItems.map((item) => ({
            id: item.id,
            feedId: item.feedId || item.origin?.streamId,
          }))),
      ...shuffledLoadingItems,
    ].filter((item, pos, self) => self.findIndex((i) => i.id === item.id) === pos);

    cookies.set(cookieName, JSON.stringify(finalItemRefs.map((item) => String(item.id))), CACHE_COOKIE_OPTIONS);

    const detailedItems: Item[] = await Promise.all(
      finalItemRefs.map((item) => loadItem(token, item)),
    );
    
    return new Response(JSON.stringify(detailedItems), { status: 200 });

  } catch (error) {
    console.error('load-random-items API error:', error);
    return new Response('An internal server error occurred.', { status: 500 });
  }
};
