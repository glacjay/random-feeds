import React, { Fragment } from 'react';
import { useRootStore } from 'src/RootStore';

export default function ItemActions(props) {
  const rootStore = useRootStore();
  const { item, isSubmitting, setIsSubmitting } = props;

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
        className="button"
        style={{ opacity: isSubmitting ? 0.5 : 1, ...props.buttonStyle }}
      >
        mark as read
      </button>

      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="button flex-row justify-center align-center"
        style={{ opacity: isSubmitting ? 0.5 : 1, textDecoration: 'none', ...props.buttonStyle }}
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
        className="button"
        style={{ opacity: isSubmitting ? 0.5 : 1, ...props.buttonStyle }}
      >
        later
      </button>
    </Fragment>
  );
}
