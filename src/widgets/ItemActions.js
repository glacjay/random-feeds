import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import React, { Fragment, useCallback } from 'react';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { lruStorage } from 'src/data';
import { useRootStore } from 'src/RootStore';
import api2 from 'src/utils/api2';

function _ItemActions(props) {
  const queryClient = useQueryClient();
  const rootStore = useRootStore();
  const { folderId, item, router } = props;

  const removeItem = useCallback(() => {
    const key = `randomItems:${folderId}`;
    const items = JSON.parse(lruStorage.get(key) || '[]');
    lruStorage.set(key, JSON.stringify(items.filter((it) => it.id !== item.id)));
    queryClient.invalidateQueries(['randomItems', folderId]);
  }, [queryClient, folderId, item?.id]);

  const markAsRead = useCallback(() => {
    runInAction(async () => {
      try {
        rootStore.isSubmitting = true;

        await api2.post(`/reader/api/0/edit-tag?i=${item.id}`, {
          a: 'user/-/state/com.google/read',
        });

        const recentlyReadItems = [
          item,
          ...JSON.parse(lruStorage.get('recentlyReadItems') || '[]'),
        ].slice(0, 42);
        lruStorage.set('recentlyReadItems', JSON.stringify(recentlyReadItems));

        removeItem();
        router?.back?.();
      } catch (ex) {
        console.warn('ItemActions.markAsRead error:', ex);
        toast(`mark as read error: ${ex}`);
      } finally {
        rootStore.isSubmitting = false;
      }
    });
  }, [rootStore, item, removeItem, router]);

  if (!item?.id) return null;

  return (
    <Fragment>
      <button
        onClick={markAsRead}
        disabled={rootStore.isSubmitting}
        className="button"
        style={{ opacity: rootStore.isSubmitting ? 0.5 : 1, ...props.buttonStyle }}
      >
        mark as read
      </button>

      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="button flex-row justify-center align-center"
        style={{
          opacity: rootStore.isSubmitting ? 0.5 : 1,
          textDecoration: 'none',
          ...props.buttonStyle,
        }}
      >
        original link
      </a>

      <button
        onClick={() => {
          removeItem();
          router?.back?.();
        }}
        disabled={rootStore.isSubmitting}
        className="button"
        style={{ opacity: rootStore.isSubmitting ? 0.5 : 1, ...props.buttonStyle }}
      >
        later
      </button>
    </Fragment>
  );
}
export default observer(_ItemActions);
