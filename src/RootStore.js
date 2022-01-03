import { makeAutoObservable } from 'mobx';
import React from 'react';

export default class RootStore {
  isSubmitting = false;

  token = null;
  folders = null;
  recentlyReadItems = [];

  constructor() {
    makeAutoObservable(this);
  }
}

export const RootStoreContext = React.createContext(null);

export function useRootStore() {
  return React.useContext(RootStoreContext);
}
