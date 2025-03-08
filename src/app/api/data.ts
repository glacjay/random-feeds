'use server';

import { cookies } from 'next/headers';

import { apiFetch } from '@/utils/api2';

import { loadItem } from './actions';

export async function loadFolders() {
  const data = await apiFetch('/reader/api/0/tag/list');
  return data.tags?.filter((tag) => /\/label\//.test(tag.id));
}

export async function loadAllUnreadCounts() {
  const data = await apiFetch('/reader/api/0/unread-count');
  return data.unreadcounts;
}

export async function loadFolderUnreadsCount(folder) {
  const folderId = folder.id?.replace(/\d+/, '-');
  const unreadCounts = await loadAllUnreadCounts();
  return unreadCounts?.find((uc) => uc.id === folderId)?.count;
}

async function loadAllSubscriptions() {
  const data = await apiFetch('/reader/api/0/subscription/list');
  return data.subscriptions.sort((s1, s2) => s1.id.localeCompare(s2.id));
}

export async function loadFolderSubscriptions(folderId) {
  const unreadCounts = await loadAllUnreadCounts();
  const allSubscriptions = await loadAllSubscriptions();
  return (
    allSubscriptions?.filter(
      (sub) =>
        sub.categories?.some((cat) => cat.id === folderId) &&
        unreadCounts?.find((uc) => uc.id === sub.id)?.count > 0,
    ) || []
  );
}

export async function loadRandomItems({ folderId }: { folderId: string }) {
  const cookieStore = await cookies();
  const localRandomItemIds = JSON.parse(
    cookieStore.get(`localRandomItemIds:${encodeURIComponent(folderId)}`)?.value || '[]',
  );
  const localRandomItems = await Promise.all(
    localRandomItemIds.map(async (itemId) => loadItem({ id: itemId })),
  );
  return localRandomItems;
}
