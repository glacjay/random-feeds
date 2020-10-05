import React from 'react';
import useRootStore from 'src/utils/rootStore';

export default function IndexPage(props) {
  const rootStore = useRootStore();
  const { token } = rootStore.persisted;
  React.useEffect(() => {
    if (!token) {
      props.history.push('/Login');
    }
  }, [token, props.history]);

  return null;
}
