'use client';

import React, { Fragment, useState } from 'react';
import { toast } from 'react-toastify';

import { markAsRead, removeItem } from '@/app/api/actions';

export async function ItemActions({ folderId, item, buttonStyle }) {
  let [isSubmitting, setIsSubmitting] = useState(false);

  if (!item?.id) return null;

  return (
    <Fragment>
      <button
        onClick={async () => {
          try {
            setIsSubmitting(true);
            await markAsRead(folderId, item.id);
            window.history.back();
          } catch (ex) {
            console.warn('ItemActions.markAsRead error:', ex);
            toast.error(ex.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={isSubmitting}
        className="button"
        style={{ opacity: isSubmitting ? 0.5 : 1, ...buttonStyle }}
      >
        mark as read
      </button>

      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="button flex-row justify-center align-center"
        style={{ opacity: isSubmitting ? 0.5 : 1, textDecoration: 'none', ...buttonStyle }}
      >
        original link
      </a>

      <button
        onClick={async () => {
          try {
            setIsSubmitting(true);
            await removeItem(folderId, item.id);
            window.history.back();
          } catch (ex) {
            console.warn('ItemActions.removeItem error:', ex);
            toast.error(ex.message);
          } finally {
            setIsSubmitting(false);
          }
        }}
        disabled={isSubmitting}
        className="button"
        style={{ opacity: isSubmitting ? 0.5 : 1, ...buttonStyle }}
      >
        later
      </button>
    </Fragment>
  );
}
