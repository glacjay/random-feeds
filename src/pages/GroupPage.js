import dayjs from 'dayjs';
import * as mobx from 'mobx';
import { observer, useLocalObservable } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api2 from 'src/utils/api2';
import useGlobalStore from 'src/utils/globalStore';

export default observer(function GroupPage(props) {
  const globalStore = useGlobalStore();
  const { token } = globalStore.persisted;

  const navprops = props.match.params || {};
  const { groupId } = navprops;

  const state = useLocalObservable(() => ({
    items: [],
  }));

  React.useEffect(() => {
    const loadFeeds = async () => {
      try {
        if (!token) {
          return;
        }

        const result = await api2.post('?api&unread_item_ids', { api_key: token });
        const unreadItemIds = result.unread_item_ids?.split(',');
        const pickedItemIds = [];
        for (let i = 0; i < 7; ++i) {
          const idx = parseInt(Math.random() * unreadItemIds.length);
          pickedItemIds.push(unreadItemIds[idx]);
          unreadItemIds.splice(idx, 1);
        }

        const pickedItems = (
          await api2.post('?api&items', { api_key: token, with_ids: pickedItemIds.join(',') })
        ).items;
        mobx.runInAction(() => {
          state.items = pickedItems;
        });
      } catch (ex) {
        console.warn('GroupPage.loadFeeds error:', ex);
        toast(`failed to load feeds: ${ex}`);
      }
    };
    loadFeeds();
  }, [token, groupId, state]);

  return (
    <div className="flex-column">
      {state.items?.map((item) => (
        <Link
          key={item.id}
          to={`/Item/${item.id}`}
          style={{ margin: 8, border: '1px solid black', padding: 16 }}
        >
          <div>{item.title}</div>
          <div
            className="flex-row align-center"
            style={{ marginTop: 8, justifyContent: 'space-between', fontSize: 12, color: 'gray' }}
          >
            <div>{item.author}</div>
            <div>{dayjs(item.created_on_time * 1000).format('YYYY-MM-DD HH:mm')}</div>
          </div>
        </Link>
      ))}
    </div>
  );
});
