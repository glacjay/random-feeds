import React, { Fragment } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useToken } from 'src/data';
import { useToast } from 'src/utils/useToast';

export default function IndexPage() {
  const { token, isSuccess } = useToken();

  if (isSuccess && !token) {
    return (
      <Link to="/Login" style={{ margin: 8, border: '1px solid black', padding: 16 }}>
        login
      </Link>
    );
  }

  return (
    <div className="flex-column" style={{ minHeight: '100vh' }}>
      <TotalUnreadsCount />
      <Folders />
      <RecentlyReadItems />
    </div>
  );
}

function TotalUnreadsCount() {
  const { token } = useToken();
  const { data, error } = useQuery('/reader/api/0/unread-count?output=json', { enabled: !!token });
  useToast(error);
  const totalUnreadsCount = data?.bq_total_unreads;

  return <div style={{ margin: '4px 4px 0' }}>未读：{totalUnreadsCount}</div>;
}

function Folders() {
  const { token } = useToken();
  const { data: folders, error } = useQuery('/reader/api/0/tag/list?output=json', {
    enabled: !!token,
    select: (data) => data.tags.filter((tag) => /\/label\//.test(tag.id)),
  });
  useToast(error);

  return (
    <Fragment>
      {folders?.map((folder) => (
        <Folder key={folder.id} folder={folder} />
      ))}
    </Fragment>
  );
}

function Folder({ folder }) {
  const { token } = useToken();
  const { data: unreadCount, error } = useQuery('/reader/api/0/unread-count?output=json', {
    enabled: !!token,
    select: (data) => {
      const folderId = folder.id?.replace(/\d+/, '-');
      const count = data.unreadcounts.find((c) => c.id === folderId);
      if (count) return count.count;
    },
  });
  useToast(error);

  return (
    <Link
      to={`/Folder?id=${folder.id}`}
      style={{ margin: '4px 4px 0', border: '1px solid black', borderRadius: 4, padding: 8 }}
    >
      {folder.id?.replace(/.*\//g, '')} ({unreadCount})
    </Link>
  );
}

function RecentlyReadItems() {
  const { data: recentlyReadItems } = useQuery('recentlyReadItems', {
    queryFn: () => localStorage.getItem('recentlyReadItems'),
    select: (data) => JSON.parse(data),
  });

  return (
    <Fragment>
      {recentlyReadItems?.length > 0 && (
        <Fragment>
          <div style={{ flex: 1, minHeight: 16 }} />
          <Link
            to={`/RecentlyReadItems`}
            style={{ margin: '4px 4px', border: '1px solid black', borderRadius: 4, padding: 8 }}
          >
            最近已读文章 ({recentlyReadItems.length})
          </Link>
        </Fragment>
      )}
    </Fragment>
  );
}
