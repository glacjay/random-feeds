'use server';

import { cookies } from 'next/headers';

import { FEVER_API_ENDPOINT } from '@/utils/api2';
import { getToken } from '@/utils/token';

import { loadItem } from './actions';

export async function loadFolders() {
  const token = getToken();
  const result = (await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/tag/list?output=json`, {
    headers: { Authorization: `GoogleLogin auth=${token}` },
  })) as any;
  const resultJson = await result.json();
  return resultJson.tags?.filter((tag) => /\/label\//.test(tag.id));
}

export async function loadAllUnreadCounts() {
  const token = getToken();
  const result = await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/unread-count?output=json`, {
    headers: { Authorization: `GoogleLogin auth=${token}` },
  });
  const resultJson = await result.json();
  return resultJson.unreadcounts;
}

export async function loadFolderUnreadsCount(folder) {
  const folderId = folder.id?.replace(/\d+/, '-');
  const unreadCounts = await loadAllUnreadCounts();
  return unreadCounts?.find((uc) => uc.id === folderId)?.count;
}

async function loadAllSubscriptions() {
  const token = getToken();
  const result = await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/subscription/list?output=json`, {
    headers: { Authorization: `GoogleLogin auth=${token}` },
  });
  const resultJson = await result.json();
  return resultJson.subscriptions.sort((s1, s2) => s1.id.localeCompare(s2.id));
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
