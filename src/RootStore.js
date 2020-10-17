import * as mobx from 'mobx';
import React from 'react';
import { toast } from 'react-toastify';
import api2 from 'src/utils/api2';

export default class RootStore {
  token = null;
  folders = null;

  constructor() {
    mobx.makeAutoObservable(this);
  }

  loadToken(token) {
    this.token = token;
    api2.token = token;
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

  *loadFolders() {
    try {
      if (!this.token) {
        return;
      }

      this.folders = (yield api2.get('/reader/api/0/tag/list?output=json')).tags.filter((tag) =>
        /\/label\//.test(tag.id),
      );

      const result = yield api2.get('/reader/api/0/unread-count?output=json');
      this.totalUnreadCounts = result.bq_total_unreads;
      const unreadCounts = result.unreadcounts;
      for (const folder of this.folders) {
        const folderId = folder.id?.replace(/\d+/, '-');
        const count = unreadCounts.find((c) => c.id === folderId);
        if (count) {
          folder.unreadCount = count.count;
        }
      }
    } catch (ex) {
      console.warn('RootStore.loadFolders error:', ex);
      toast(`load folders error: ${ex}`);
    }
  }

  *loadItems({ folderId, reloadItems, reloadRandomItems }) {
    try {
      if (!this.token || !folderId) {
        return;
      }
      if (!this.folders) {
        yield this.loadFolders();
      }
      const folder = this.folders?.find((f) => f.id === folderId);
      if (!folder) {
        return;
      }

      if (reloadItems) {
        folder.items = null;
      }
      if (reloadItems || reloadRandomItems) {
        folder.randomItems = null;
      }

      let { items } = folder;
      if (!(items?.length > 0) && !reloadItems) {
        const itemsStr = yield localStorage.getItem('items:' + folderId);
        if (itemsStr) {
          items = JSON.parse(itemsStr);
          folder.items = items;
        }
      }
      if (!(items?.length > 0) || reloadItems) {
        items = (yield api2.get('/reader/api/0/stream/items/ids', {
          output: 'json',
          s: folderId,
          xt: 'user/-/state/com.google/read',
          r: 'o',
          n: 10000,
        })).itemRefs;
        folder.items = items;
        yield localStorage.setItem('items:' + folderId, JSON.stringify(items));
      }

      let { randomItems } = folder;
      if (!(randomItems?.length > 0) && !reloadRandomItems) {
        const randomItemsStr = yield localStorage.getItem('randomItems:' + folderId);
        if (randomItemsStr) {
          randomItems = JSON.parse(randomItemsStr);
          folder.randomItems = randomItems;
        }
      }
      if (!(randomItems?.length > 0) || reloadItems || reloadRandomItems) {
        const indics = Array.from(
          new Set(
            Array(7)
              .fill()
              .map(() => parseInt(Math.random() * items.length)),
          ),
        );
        randomItems = (yield api2.get(
          `/reader/api/0/stream/items/contents?output=json${indics
            .map((idx) => `&i=${items[idx].id}`)
            .join('')}`,
        )).items.map((item, idx) => ({ ...item, id: items[idx].id }));
        folder.randomItems = randomItems;
        yield localStorage.setItem('randomItems:' + folderId, JSON.stringify(randomItems));
      }
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

      yield this.removeItems(itemIds, 'items');
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
