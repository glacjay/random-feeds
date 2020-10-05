import * as mobx from 'mobx';
import { observer, useLocalObservable } from 'mobx-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api2 from 'src/utils/api2';
import useGlobalStore from 'src/utils/globalStore';

export default observer(function IndexPage(props) {
  const globalStore = useGlobalStore();
  const { token } = globalStore.persisted;

  const state = useLocalObservable(() => ({
    groups: [],
  }));

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        if (!token) {
          return;
        }
        const result = await api2.post('?api&groups', { api_key: token });
        mobx.runInAction(() => {
          state.groups = result.groups;
        });
      } catch (ex) {
        console.warn('IndexPage.loadGroups error:', ex);
        toast(`failed to load groups: ${ex}`);
      }
    };
    loadGroups();
  }, [token, state]);

  if (!token) {
    return (
      <Link to="/Login" style={{ padding: 16 }}>
        login
      </Link>
    );
  }

  return (
    <div className="flex-column">
      {state.groups?.map((group) => (
        <Link
          key={group.id}
          to={`/Group/${group.id}`}
          style={{ margin: 8, border: '1px solid black', padding: 16 }}
        >
          {group.title}
        </Link>
      ))}
    </div>
  );
});
