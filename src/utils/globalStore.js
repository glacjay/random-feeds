import * as mobx from 'mobx';
import React from 'react';

export class GlobalStore {
  persisted = {
    isLoaded: false,
    token: null,
  };

  constructor() {
    mobx.makeAutoObservable(this);
  }

  setPersisted(persisted) {
    this.persisted = persisted;
  }

  setToken(token) {
    this.persisted.token = token;
  }
}

export const GlobalStoreContext = React.createContext(null);

export default function useGlobalStore() {
  return React.useContext(GlobalStoreContext);
}
