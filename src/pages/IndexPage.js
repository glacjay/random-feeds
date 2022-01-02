import { observer } from 'mobx-react';
import React, { Fragment } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useRootStore } from 'src/RootStore';
import { useToast } from 'src/utils/useToast';

export default observer(function IndexPage(props) {
  const rootStore = useRootStore();
  React.useEffect(() => {
    const init = async () => {
      await rootStore.init();
      await rootStore.loadFolders();
    };
    init();
  }, [rootStore, rootStore.token]);

  const { data: token, isSuccess } = useQuery('token', () => localStorage.getItem('token'));

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

      {rootStore.folders?.map((folder) => (
        <Link
          key={folder.id}
          to={`/Folder?id=${folder.id}`}
          style={{ margin: '4px 4px 0', border: '1px solid black', borderRadius: 4, padding: 8 }}
        >
          {folder.id?.replace(/.*\//g, '')} ({folder.unreadCount})
        </Link>
      ))}

      {rootStore.recentlyReadItems?.length > 0 && (
        <Fragment>
          <div style={{ flex: 1, minHeight: 16 }} />
          <Link
            to={`/RecentlyReadItems`}
            style={{ margin: '4px 4px', border: '1px solid black', borderRadius: 4, padding: 8 }}
          >
            最近已读文章
          </Link>
        </Fragment>
      )}
    </div>
  );
});

function TotalUnreadsCount() {
  const { data: token } = useQuery('token', () => localStorage.getItem('token'));

  const { data, error } = useQuery('/reader/api/0/unread-count?output=json', { enabled: !!token });
  useToast(error);
  const totalUnreadsCount = data?.bq_total_unreads;

  return <div style={{ margin: '4px 4px 0' }}>未读：{totalUnreadsCount}</div>;
}
