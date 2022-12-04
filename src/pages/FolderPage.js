import dayjs from 'dayjs';
import { observer } from 'mobx-react';
import qs from 'qs';
import React, { Fragment, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  lruStorage,
  useFeedUnreadsCount,
  useFolders,
  useFolderUnreadsCount,
  useItem,
  useRandomItems,
} from 'src/data';
import { useRootStore } from 'src/RootStore';
import { useToast } from 'src/utils/useToast';
import ItemActions from 'src/widgets/ItemActions';

export default observer(function FolderPage(props) {
  const { pathname } = useLocation();
  useEffect(() => {
    setTimeout(() => window.scrollTo(0, 0), 222);
  }, [pathname]);

  const rootStore = useRootStore();

  const query = qs.parse(props.location.search.slice(1));
  const { id: folderId } = query;

  const { folders, error } = useFolders();
  useToast(error);
  const folder = folders?.find((f) => f.id === folderId);

  const reloadItems = useCallback(() => {
    lruStorage.delete(`randomItems:${folderId}`);
    setTimeout(() => window.location.reload(), 500);
  }, [folderId]);

  if (!folder) return null;

  return (
    <div className="flex-column" style={{ paddingBottom: 4 }}>
      <div className="flex-row" style={{ margin: '4px 4px 0' }}>
        {folder?.id?.replace(/.*\//g, '')}：<RandomItemsCount folder={folder} />/
        <FolderUnreadsCount folder={folder} />
        <div style={{ flex: 1 }} />
        {localStorage.length}
      </div>

      <RandomItems folder={folder} />

      <div style={{ height: 100 }} />
      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        <button
          onClick={reloadItems}
          disabled={rootStore.isSubmitting}
          className="button"
          style={{ height: 44, opacity: rootStore.isSubmitting ? 0.5 : 1, flex: 1 }}
        >
          reload random items
        </button>
      </div>
    </div>
  );
});

function FolderUnreadsCount({ folder }) {
  const { unreadsCount, error } = useFolderUnreadsCount(folder);
  useToast(error);

  return <Fragment>{unreadsCount}</Fragment>;
}

function RandomItemsCount({ folder }) {
  const { randomItems, error } = useRandomItems({ folderId: folder.id });
  useToast(error);

  return <Fragment>{randomItems?.length}</Fragment>;
}

function RandomItems({ folder }) {
  const { randomItems, error } = useRandomItems({ folderId: folder.id });
  useToast(error);

  return (
    <Fragment>
      {randomItems?.map((item) => (
        <Item key={item.id} folderId={folder.id} item={item} />
      ))}
    </Fragment>
  );
}

function Item({ folderId, item }) {
  const query = useItem(item);
  item = query.item || item;

  const unreadCount = useFeedUnreadsCount(item.origin?.streamId);

  return (
    <div
      style={{
        margin: 4,
        marginBottom: 0,
        border: '1px solid black',
        borderRadius: 4,
        padding: 8,
      }}
    >
      <Link to={`/Item?${qs.stringify({ folderId, id: item.id })}`}>
        <div>{item.title}</div>
        <div
          className="flex-row align-center"
          style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
        >
          <div>
            ({unreadCount}) {item.origin?.title} | {item.author}
          </div>
          <div>{dayjs(item.updated * 1000).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      </Link>

      <div className="flex-row align-center" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
        <ItemActions folderId={folderId} item={item} />
      </div>
    </div>
  );
}
