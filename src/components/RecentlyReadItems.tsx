'use client'; // This will be an interactive component if it has state, otherwise it can be a simple .tsx

import React, { Fragment } from 'react';
import type { Item } from '@/lib/types';

interface Props {
    items: Item[];
}

export function RecentlyReadItems({ items }: Props) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <div style={{ flex: 1, minHeight: 16 }} />
      <a
        href="/recently"
        className="block p-2 my-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-center"
      >
        最近已读文章 ({items.length})
      </a>
    </Fragment>
  );
}

