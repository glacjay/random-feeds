import { apiFetch } from '@/lib/api';
import type { Item, UnreadCount, Folder, Subscription, UnreadSummary } from './types';
import type { APIContext } from 'astro';

export async function loadFolders(token: string): Promise<Folder[]> {
  const data = await apiFetch('/reader/api/0/tag/list', { token });
  return data.tags?.filter((tag: { id: string }) => /\/label\//.test(tag.id)) || [];
}

export async function loadAllUnreadCounts(token: string): Promise<UnreadCount[]> {
  const data = await apiFetch('/reader/api/0/unread-count', { token });
  return data.unreadcounts || [];
}

export async function loadUnreadSummary(token: string): Promise<UnreadSummary> {
  const data = await apiFetch('/reader/api/0/unread-count', { token });
  return {
    unreadcounts: data.unreadcounts || [],
    bq_total_unreads: data.bq_total_unreads,
  };
}

async function loadAllSubscriptions(token: string): Promise<Subscription[]> {
  const data = await apiFetch('/reader/api/0/subscription/list', { token });
  return (data.subscriptions || []).sort((s1: Subscription, s2: Subscription) =>
    s1.id.localeCompare(s2.id),
  );
}

export async function loadFolderSubscriptions(token: string, folderId: string): Promise<Subscription[]> {
  const [unreadCounts, allSubscriptions] = await Promise.all([
    loadAllUnreadCounts(token),
    loadAllSubscriptions(token),
  ]);

  return (
    allSubscriptions.filter(
      (sub) =>
        sub.categories?.some((cat) => cat.id === folderId) &&
        (unreadCounts.find((uc) => uc.id === sub.id)?.count || 0) > 0,
    ) || []
  );
}

export async function loadFeedUnreadsCount(token: string, subscriptionId: string | undefined): Promise<number> {
    if (!subscriptionId) return 0;
    const unreadCounts = await loadAllUnreadCounts(token);
    return unreadCounts?.find((uc) => uc.id === subscriptionId)?.count || 0;
}

export async function loadItem(token: string, item: Partial<Item>): Promise<Item> {
    if (item.crawlTimeMsec) return item as Item;

    const json = await apiFetch('/reader/api/0/stream/items/contents', {
        token,
        queryParams: { i: item.id! },
    });

    return {
        ...json.items[0],
        id: item.id!,
    };
}

export async function loadRandomItemsForFolder(
  context: APIContext,
  token: string,
  folderId: string,
): Promise<Item[]> {
  const cookieName = `localRandomItemIds:${encodeURIComponent(folderId)}`;
  const localRandomItemIds: Array<string | number> = JSON.parse(
    context.cookies.get(cookieName)?.value || '[]',
  );

  if (localRandomItemIds.length === 0) {
    return [];
  }

  return Promise.all(localRandomItemIds.map((itemId) => loadItem(token, { id: String(itemId) })));
}

export async function loadRecentlyReadItems(context: APIContext, token: string): Promise<Item[]> {
    const recentlyReadItemIds: string[] = JSON.parse(context.cookies.get('recentlyReadItemIds')?.value || '[]');
    if (recentlyReadItemIds.length === 0) return [];

    return Promise.all(recentlyReadItemIds.map(id => loadItem(token, { id })));
}
