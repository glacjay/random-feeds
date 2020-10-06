import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import qs from 'qs';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRootStore } from 'src/RootStore';

export default observer(function GroupPage(props) {
  const rootStore = useRootStore();

  const query = qs.parse(props.location.search.slice(1));
  const { id: folderId } = query;
  const folder = rootStore.folders?.find((folder) => folder.id === folderId);

  React.useEffect(() => {
    rootStore.loadItems({ folderId });
  }, [rootStore, rootStore.token, folderId]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  return (
    <div className="flex-column">
      {folder?.randomItems?.map((item) => (
        <Link
          key={item.id}
          to={`/Item?id=${item.id}`}
          style={{ margin: 8, border: '1px solid black', padding: 16 }}
        >
          <div>{item.title}</div>
          <div
            className="flex-row align-center"
            style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
          >
            <div>{item.origin.title}</div>
            <div>{dayjs(item.updated * 1000).format('YYYY-MM-DD HH:mm')}</div>
          </div>
        </Link>
      ))}

      <div style={{ height: 50 }} />
      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        <button
          onClick={() => {
            setIsSubmitting(true);
            rootStore.loadItems({ folderId, reloadItems: true });
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
          style={{ flex: 1 }}
        >
          reload folder items
        </button>
        <button
          onClick={async () => {
            setIsSubmitting(true);
            rootStore.markFolderAsRead(folderId);
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
          style={{ flex: 1 }}
        >
          mark them as read
        </button>
        <button
          onClick={() => {
            setIsSubmitting(true);
            rootStore.loadItems({ folderId, reloadRandomItems: true });
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
          style={{ flex: 1 }}
        >
          reload random items
        </button>
      </div>
    </div>
  );
});
