import dayjs from 'dayjs';
import * as mobx from 'mobx';
import { observer, useLocalObservable } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api2 from 'src/utils/api2';
import useGlobalStore from 'src/utils/globalStore';

export default observer(function ItemPage(props) {
  const globalStore = useGlobalStore();
  const { token } = globalStore.persisted;

  const navprops = props.match.params || {};
  const { itemId } = navprops;

  const state = useLocalObservable(() => ({
    item: null,
  }));

  React.useEffect(() => {
    const loadFeeds = async () => {
      try {
        if (!token) {
          return;
        }

        const pickedItems = (await api2.post('?api&items', { api_key: token, with_ids: itemId }))
          .items;
        mobx.runInAction(() => {
          state.item = pickedItems[0];
        });
      } catch (ex) {
        console.warn('GroupPage.loadFeeds error:', ex);
        toast(`failed to load feeds: ${ex}`);
      }
    };
    loadFeeds();
  }, [token, itemId, state]);

  const markAsRead = async () => {
    try {
      await api2.post('?api', { api_key: token, mark: 'item', as: 'read', id: state.item?.id });
      props.history.goBack();
    } catch (ex) {
      console.warn('ItemPage.markAsRead error:', ex);
      toast(`mark item as read failed: ${ex}`);
    }
  };

  return (
    <div className="flex-column">
      <a
        href={state.item?.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-column"
        style={{
          background: 'lightgray',
          padding: 8,
        }}
      >
        <div style={{ fontWeight: 'bold' }}>{state.item?.title}</div>
        <div
          className="flex-row align-center"
          style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
        >
          <div>{state.item?.author}</div>
          <div>{dayjs(state.item?.created_on_time * 1000).format('YYYY-MM-DD HH:mm')}</div>
        </div>
      </a>

      <div dangerouslySetInnerHTML={{ __html: state.item?.html }} style={{ maxWidth: '100vw' }} />

      <div
        className="flex-row"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 7, height: 50 }}
      >
        <button onClick={markAsRead} style={{ flex: 1 }}>
          mark as read
        </button>
        <button onClick={() => props.history.goBack()} style={{ flex: 1 }}>
          return
        </button>
      </div>
    </div>
  );
});
