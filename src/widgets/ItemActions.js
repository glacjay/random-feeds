'use client';

import { useRouter } from 'next/navigation';
import React, { Fragment, useState } from 'react';
import { toast } from 'react-toastify';

import { markAsRead, removeItem } from '@/app/api/actions';

export function ItemActions({ folderId, item, buttonStyle }) {
  let router = useRouter();
  let [isSubmitting, setIsSubmitting] = useState(false);

  if (!item?.id) return null;

  const executeAndMarkAsRead = async (action) => {
    try {
      setIsSubmitting(true);
      action?.();
      await markAsRead(folderId, item.id);
      router.back();
    } catch (ex) {
      console.warn('ItemActions.markAsRead error:', ex);
      toast.error(ex.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Fragment>
      <button
        onClick={() => executeAndMarkAsRead()}
        disabled={isSubmitting}
        className="button"
        style={{ opacity: isSubmitting ? 0.5 : 1, ...buttonStyle }}
      >
        已读
      </button>

      <a
        href={item?.canonical?.[0]?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="button flex-row justify-center align-center"
        style={{ opacity: isSubmitting ? 0.5 : 1, textDecoration: 'none', ...buttonStyle }}
      >
        原文
      </a>

      <button
        onClick={() =>
          executeAndMarkAsRead(() => window.open(item?.canonical?.[0]?.href, '_blank'))
        }
        disabled={isSubmitting}
        className="button"
        style={{ opacity: isSubmitting ? 0.5 : 1, ...buttonStyle }}
      >
        {'读&开'}
      </button>

      <button
        onClick={async () => {
          try {
            setIsSubmitting(true);
            await removeItem(folderId, item.id);
            router.back();
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
        稍后
      </button>
    </Fragment>
  );
}
