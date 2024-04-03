import Link from 'next/link';
import React, { Fragment, use } from 'react';

import { FEVER_API_ENDPOINT } from '@/utils/api2';
import { getToken } from '@/utils/token';

import { RecentlyReadItems } from './RecentlyReadItems';

export default function Page() {
  const token = getToken();

  if (!token) {
    return <Link href="/login">Sign in</Link>;
  }

  return (
    <div className="flex-column" style={{ minHeight: '100vh' }}>
      <div
        className="flex-row align-center"
        style={{ margin: '0 4px', justifyContent: 'space-between' }}
      >
        <TotalUnreadsCount />
        <a href="/broken-feeds">Broken Feeds</a>
      </div>
      <Folders />
      <RecentlyReadItems />
    </div>
  );
}

async function TotalUnreadsCount() {
  const token = getToken();
  const response = await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/unread-count?output=json`, {
    headers: { Authorization: `GoogleLogin auth=${token}` },
  });
  const data = await response.json();
  const totalUnreadsCount = data.bq_total_unreads;

  return <div style={{}}>未读：{totalUnreadsCount}</div>;
}

function Folders() {
  async function getData() {
    const token = getToken();
    const result = (await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/tag/list?output=json`, {
      headers: { Authorization: `GoogleLogin auth=${token}` },
    })) as any;
    const resultJson = await result.json();
    return resultJson.tags.filter((tag) => /\/label\//.test(tag.id));
  }
  const folders = use(getData());

  return (
    <Fragment>
      {folders?.map((folder) => (
        <Folder key={folder.id} folder={folder} />
      ))}
    </Fragment>
  );
}

function Folder({ folder }) {
  async function getData() {
    const token = getToken();
    const result = await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/unread-count?output=json`, {
      headers: { Authorization: `GoogleLogin auth=${token}` },
    });
    const data = await result.json();
    const folderId = folder.id?.replace(/\d+/, '-');
    return data.unreadcounts?.find((uc) => uc.id === folderId)?.count;
  }
  const unreadsCount = use(getData());

  return (
    <Link
      href={`/folder?id=${folder.id}`}
      style={{ margin: '4px 4px 0', border: '1px solid black', borderRadius: 4, padding: 8 }}
    >
      {folder.id?.replace(/.*\//g, '')} ({unreadsCount})
    </Link>
  );
}
