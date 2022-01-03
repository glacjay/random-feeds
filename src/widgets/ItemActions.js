import { action } from 'mobx';
import { observer } from 'mobx-react';
import React, { Fragment } from 'react';
import { useRootStore } from 'src/RootStore';

export default observer(function ItemActions(props) {
  const rootStore = useRootStore();
  const { item } = props;

  return (
    <Fragment>
      <button
        onClick={action(async () => {
          rootStore.isSubmitting = true;
          if (await rootStore.markItemsAsRead([item?.id])) {
            if (props.folderId) {
              rootStore.loadItems({ folderId: props.folderId });
            }
            if (props.history?.goBack) {
              props.history.goBack();
            }
          }
          rootStore.isSubmitting = false;
        })}
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
          rootStore.removeItems([item?.id], 'randomItems');
          if (props.history?.goBack) {
            props.history.goBack();
          }
        }}
        disabled={rootStore.isSubmitting}
        className="button"
        style={{ opacity: rootStore.isSubmitting ? 0.5 : 1, ...props.buttonStyle }}
      >
        later
      </button>
    </Fragment>
  );
});
