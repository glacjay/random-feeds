import { observer } from 'mobx-react';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useRootStore } from 'src/RootStore';

export default observer(function IndexPage(props) {
  const rootStore = useRootStore();
  React.useEffect(() => {
    const init = async () => {
      await rootStore.init();
      await rootStore.loadFolders();
    };
    init();
  }, [rootStore, rootStore.token]);

  if (!rootStore.token) {
    return (
      <Link to="/Login" style={{ margin: 8, border: '1px solid black', padding: 16 }}>
        login
      </Link>
    );
  }

  return (
    <div className="flex-column" style={{ minHeight: '100vh' }}>
      <div style={{ margin: '4px 4px 0' }}>未读：{rootStore.totalUnreadCounts}</div>

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
