import React, { Fragment } from 'react';
import { useRootStore } from 'src/RootStore';

export default function ItemActions(props) {
  const rootStore = useRootStore();
  const { folderId, item, isSubmitting, setIsSubmitting } = props;

  return (
    <Fragment>
      <button
        onClick={async () => {
          setIsSubmitting(true);
          if (await rootStore.markItemsAsRead([item?.id])) {
            if (props.history?.goBack) {
              props.history.goBack();
            }
          }
          setIsSubmitting(false);
        }}
        disabled={isSubmitting}
        style={{ padding: '4px 8px', ...props.buttonStyle }}
      >
        mark as read
      </button>
      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-row justify-center align-center"
        style={{
          border: '1px solid lightgray',
          borderRadius: 4,
          background: 'white',
          padding: '4px 8px',
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
        disabled={isSubmitting}
        style={{ padding: '4px 8px', ...props.buttonStyle }}
      >
        later
      </button>
    </Fragment>
  );
}
