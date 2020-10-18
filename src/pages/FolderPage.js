import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import qs from 'qs';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRootStore } from 'src/RootStore';
import ItemActions from 'src/widgets/ItemActions';

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
    <div className="flex-column" style={{ paddingBottom: 4 }}>
      <div style={{ margin: '4px 4px 0' }}>
        {folder?.id}：{folder?.unreadCount}
      </div>

      {folder?.randomItems?.map((item) => (
        <div
          style={{
            margin: 4,
            marginBottom: 0,
            border: '1px solid black',
            borderRadius: 4,
            padding: 8,
          }}
        >
          <Link key={item.id} to={`/Item?folderId=${folderId}&id=${item.id}`}>
            <div>{item.title}</div>
            <div
              className="flex-row align-center"
              style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
            >
              <div>
                {item.origin.title} | {item.author}
              </div>
              <div>{dayjs(item.updated * 1000).format('YYYY-MM-DD HH:mm')}</div>
            </div>
          </Link>
          <div
            className="flex-row align-center"
            style={{ marginTop: 8, justifyContent: 'flex-end' }}
          >
            <ItemActions
              item={item}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </div>
        </div>
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
            await rootStore.markItemsAsRead(folder.randomItems.map((item) => item.id));
            await rootStore.loadItems({ folderId });
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
