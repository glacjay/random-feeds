import * as mobx from 'mobx';
import React from 'react';
import { toast } from 'react-toastify';
import api2 from 'src/utils/api2';

export default class RootStore {
  token = null;
  folders = null;
  recentlyReadItems = null;

  constructor() {
    mobx.makeAutoObservable(this);
  }

  *init() {
    try {
      const token = yield localStorage.getItem('token');
      this.token = token;
      api2.token = token;

      this.folders = JSON.parse(yield localStorage.getItem('folders'));
      this.folders.forEach((folder) => this.loadItemsFromLocal(folder));
    } catch (ex) {
      console.warn('RootStore.init error:', ex);
      toast(`init error: ${ex}`);
    }
  }

  *login(account, password) {
    try {
      const result = yield api2.post('/accounts/ClientLogin', { Email: account, Passwd: password });
      const json = {};
      result
        .split('\n')
        .filter((l) => l)
        .forEach((line) => {
          const idx = line.indexOf('=');
          if (idx > 0) {
            json[line.substr(0, idx)] = line.substr(idx + 1);
          } else {
            json[line] = true;
          }
        });
      if (!json.Auth) {
        throw new Error('account or password incorrect');
      }

      this.token = json.Auth;
      yield localStorage.setItem('token', this.token);
      api2.token = this.token;
      return true;
    } catch (ex) {
      console.warn('RootStore.login error:', ex);
      toast(`login failed: ${ex}`);
      return false;
    }
  }

  get loadedItems() {
    const items = {};
    for (const folder of this.folders || []) {
      for (const item of folder.randomItems || []) {
        items[item.id] = item;
      }
    }
    return items;
  }

  *loadFolders() {
    try {
      if (!this.token) {
        return;
      }

      this.folders = (yield api2.get('/reader/api/0/tag/list?output=json')).tags.filter((tag) =>
        /\/label\//.test(tag.id),
      );

      const subscriptions = (yield api2.get('/reader/api/0/subscription/list?output=json'))
        .subscriptions;
      for (const folder of this.folders) {
        folder.subscriptions = subscriptions.filter((sub) =>
          sub.categories?.some((cat) => cat.id === folder?.id),
        );
      }

      yield this.loadUnreadCounts(this.folders);
      this.folders.forEach((folder) => this.loadItemsFromLocal(folder));

      yield localStorage.setItem(
        'folders',
        JSON.stringify(
          mobx.toJS(this.folders?.map((folder) => ({ ...folder, randomItems: null }))),
        ),
      );
    } catch (ex) {
      console.warn('RootStore.loadFolders error:', ex);
      toast(`load folders error: ${ex}`);
    }
  }

  *loadUnreadCounts(folders) {
    const result = yield api2.get('/reader/api/0/unread-count?output=json');
    this.totalUnreadCounts = result.bq_total_unreads;
    const unreadCounts = result.unreadcounts;
    for (const folder of folders) {
      const folderId = folder.id?.replace(/\d+/, '-');
      const count = unreadCounts.find((c) => c.id === folderId);
      if (count) {
        folder.unreadCount = count.count;
      }

      for (const sub of folder.subscriptions || []) {
        const subCount = unreadCounts.find((c) => c.id === sub.id);
        if (subCount) {
          sub.unreadCount = subCount.count;
        }
      }
    }
  }

  *loadItemsFromLocal(folder) {
    let randomItems = yield localStorage.getItem(`randomItems:${folder.id}`);
    if (randomItems) {
      folder.randomItems = JSON.parse(randomItems);
      return;
    }
  }

  *loadItems({ folderId, reloadItems }) {
    try {
      if (!this.token || !folderId) {
        return;
      }
      const folder = this.folders?.find((f) => f.id === folderId);
      if (!folder) {
        return;
      }

      if (reloadItems) {
        yield this.loadUnreadCounts([folder]);
        folder.randomItems = null;
      }

      let randomItems = folder.randomItems;
      if (randomItems) return;

      if (!reloadItems) {
        yield this.loadItemsFromLocal(folder);
        if (folder.randomItems) {
          return;
        }
      }

      const subscriptions = [...folder.subscriptions.filter((sub) => sub.unreadCount > 0)];
      for (let i = subscriptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [subscriptions[i], subscriptions[j]] = [subscriptions[j], subscriptions[i]];
      }

      let totalUnreadCount = subscriptions.reduce((acc, sub) => acc + sub.unreadCount, 0);
      const feeds = {};
      for (
        let i = 0;
        Object.values(feeds).reduce((acc, c) => acc + c, 0) < 42 && totalUnreadCount > 0;
        i = (i + 1) % subscriptions.length
      ) {
        if (!feeds[subscriptions[i].id]) {
          feeds[subscriptions[i].id] = 0;
        }
        if (feeds[subscriptions[i].id] < subscriptions[i].unreadCount) {
          feeds[subscriptions[i].id] += 1;
        }
        totalUnreadCount -= 1;
      }

      const newItems = yield Promise.all(
        Object.keys(feeds).map(
          async (subId) =>
            (
              await api2.get('/reader/api/0/stream/items/ids', {
                output: 'json',
                s: subId,
                xt: 'user/-/state/com.google/read',
                r: 'o',
                n: feeds[subId],
              })
            ).itemRefs,
        ),
      );
      folder.items = newItems.reduce((acc, arr) => [...acc, ...arr], []);

      randomItems = yield Promise.all(
        folder.items.map(async (item) => ({
          ...(await api2.get(`/reader/api/0/stream/items/contents?output=json&i=${item.id}`))
            .items[0],
          id: item.id,
        })),
      );
      folder.randomItems = randomItems;
      yield localStorage.setItem(`randomItems:${folder.id}`, JSON.stringify(randomItems));
    } catch (ex) {
      console.warn('RootStore.loadItems error:', ex);
      toast(`load items error: ${ex}`);
    }
  }

  *markItemsAsRead(itemIds) {
    try {
      if (!this.token || !(itemIds?.length > 0)) {
        return false;
      }

      yield api2.post(`/reader/api/0/edit-tag?${itemIds.map((id) => `i=${id}`).join('&')}`, {
        a: 'user/-/state/com.google/read',
      });

      yield this.removeItems(itemIds, 'randomItems');

      return true;
    } catch (ex) {
      console.warn('RootStore.markItemsAsRead error:', ex);
      toast(`mark item as read error: ${ex}`);
      return false;
    }
  }

  *removeItems(itemIds, field) {
    for (const folder of this.folders || []) {
      if (folder[field]?.some((item) => itemIds.includes(item.id))) {
        folder[field] = folder[field].filter((item) => !itemIds.includes(item.id));
        yield localStorage.setItem(`${field}:${folder.id}`, JSON.stringify(folder[field]));
      }
    }
  }
}

export const RootStoreContext = React.createContext(null);

export function useRootStore() {
  return React.useContext(RootStoreContext);
}
