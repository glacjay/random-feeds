import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import qs from 'qs';
import React from 'react';
import { Link } from 'react-router-dom';
import { useRootStore } from 'src/RootStore';
import ItemActions from 'src/widgets/ItemActions';

export default observer(function FolderPage(props) {
  const rootStore = useRootStore();

  const query = qs.parse(props.location.search.slice(1));
  const { id: folderId } = query;
  React.useEffect(() => {
    const init = async () => {
      await rootStore.init();
      await rootStore.loadItems({ folderId });
    };
    init();
  }, [rootStore, folderId]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const folder = rootStore.folders?.find((f) => f.id === folderId);
  if (!folder) return null;

  return (
    <div className="flex-column" style={{ paddingBottom: 4 }}>
      <div style={{ margin: '4px 4px 0' }}>
        {folder?.id?.replace(/.*\//g, '')}：{folder?.randomItems?.length}/{folder?.unreadCount}
      </div>

      {folder?.randomItems?.map((item) => (
        <div
          key={item.id}
          style={{
            margin: 4,
            marginBottom: 0,
            border: '1px solid black',
            borderRadius: 4,
            padding: 8,
          }}
        >
          <Link to={`/Item?id=${item.id}`}>
            <div>{item.title}</div>
            <div
              className="flex-row align-center"
              style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
            >
              <div>
                {item.origin?.title} | {item.author}
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

      <div style={{ height: 100 }} />
      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        {Math.random() > 2 && (
          <button
            onClick={async () => {
              setIsSubmitting(true);
              await rootStore.markItemsAsRead(folder.randomItems.map((item) => item.id));
              await rootStore.loadItems({ folderId });
              setIsSubmitting(false);
            }}
            disabled={isSubmitting}
            className="button"
            style={{ height: 44, opacity: isSubmitting ? 0.5 : 1, flex: 1 }}
          >
            mark them as read
          </button>
        )}

        <button
          onClick={() => {
            setIsSubmitting(true);
            rootStore.loadItems({ folderId, reloadItems: true });
            setIsSubmitting(false);
          }}
          disabled={isSubmitting}
          className="button"
          style={{ height: 44, opacity: isSubmitting ? 0.5 : 1, flex: 1 }}
        >
          reload random items
        </button>
      </div>
    </div>
  );
});
