import React, { Fragment } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useFolders, useFolderUnreadsCount, useToken } from 'src/data';
import { useToast } from 'src/utils/useToast';

export default function IndexPage(props) {
  const { token, isSuccess } = useToken();

  if (isSuccess && !token) {
    props.history.push('/Login');
    return null;
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
  const { folders, error } = useFolders();
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
  const { unreadsCount, error } = useFolderUnreadsCount(folder);
  useToast(error);

  return (
    <Link
      to={`/Folder?id=${folder.id}`}
      style={{ margin: '4px 4px 0', border: '1px solid black', borderRadius: 4, padding: 8 }}
    >
      {folder.id?.replace(/.*\//g, '')} ({unreadsCount})
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
