import { observer } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRootStore } from 'src/RootStore';

export default observer(function IndexPage(props) {
  const rootStore = useRootStore();

  React.useEffect(() => {
    rootStore.loadFolders();
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
      {rootStore.folders?.map((folder) => (
        <Link
          key={folder.id}
          to={`/Folder?id=${folder.id}`}
          style={{ margin: 8, border: '1px solid black', padding: 16 }}
        >
          {folder.id}
        </Link>
      ))}
    </div>
  );
});
