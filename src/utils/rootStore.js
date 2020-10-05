import * as mobx from 'mobx';
import React from 'react';

export class RootStore {
  persisted = {
    token: null,
  };

  constructor() {
    mobx.makeAutoObservable(this);
  }

  setToken(token) {
    this.persisted.token = token;
  }
}

export const RootStoreContext = React.createContext(new RootStore());

export default function useRootStore() {
  const rootStore = React.useContext(RootStoreContext);
  return rootStore;
}
