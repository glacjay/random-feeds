import dayjs from 'dayjs';
import Link from 'next/link';
import qs from 'qs';
import React, { Fragment } from 'react';

import { ScrollToBottom } from '@/widgets/ScrollToBottom';

import { loadFeedUnreadsCount, loadItem } from '../api/actions';
import { loadFolders, loadFolderUnreadsCount, loadRandomItems } from '../api/data';
import { ReloadingButton } from './ReloadingButton';

export default async function Page({ searchParams }) {
  const { id: folderId } = searchParams;

  const folders = await loadFolders();
  const folder = folders?.find((f) => f.id === folderId);

  if (!folder) return null;

  return (
    <div className="flex-column" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex-row" style={{ margin: '4px 4px 0' }}>
        <div>{folder?.id?.replace(/.*\//g, '')}：</div>
        <RandomItemsCount folder={folder} />
        <div>/</div>
        <FolderUnreadsCount folder={folder} />

        {/* <div style={{ flex: 1 }} />
        <div>{localStorage.length}</div> */}
      </div>

      <RandomItems folder={folder} />

      <div style={{ height: 100 }} />
      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        <ReloadingButton folderId={folder.id} isReloading={true} />
        <ReloadingButton folderId={folder.id} isReloading={false} />
      </div>
    </div>
  );
}

async function RandomItemsCount({ folder }) {
  const randomItems = await loadRandomItems({ folderId: folder.id });

  return <Fragment>{randomItems?.length}</Fragment>;
}

async function FolderUnreadsCount({ folder }) {
  let unreadsCount = await loadFolderUnreadsCount(folder);

  return <Fragment>{unreadsCount}</Fragment>;
}

async function RandomItems({ folder }) {
  let randomItems = await loadRandomItems({ folderId: folder.id });
  randomItems.reverse();

  return (
    <Fragment>
      {randomItems?.map((item) => (
        <Item key={item.id} folderId={folder.id} item={item} />
      ))}
      <ScrollToBottom />
    </Fragment>
  );
}

async function Item({ folderId, item }) {
  const query = await loadItem(item);
  item = query.item || item;

  const unreadCount = await loadFeedUnreadsCount(item.origin?.streamId);

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
      <Link href={`/item?${qs.stringify({ folderId, id: item.id })}`}>
        <div style={{ wordBreak: 'break-word' }}>{item.title}</div>
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
    </div>
  );
}
