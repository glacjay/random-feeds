import { observer } from 'mobx-react';
import React from 'react';
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
    <div className="flex-column">
      <div style={{ margin: '4px 4px 0' }}>未读：{rootStore.totalUnreadCounts}</div>

      {rootStore.folders?.map((folder) => (
        <Link
          key={folder.id}
          to={`/Folder?id=${folder.id}`}
          style={{ margin: '4px 4px 0', border: '1px solid black', borderRadius: 4, padding: 8 }}
        >
          {folder.id} ({folder.unreadCount})
        </Link>
      ))}
    </div>
  );
});
