'use client';

import Link from 'next/link';
import React, { Fragment } from 'react';

import { useRecentlyReadItems } from '@/data';

export function RecentlyReadItems() {
  const [recentlyReadItems] = useRecentlyReadItems();

  return (
    <Fragment>
      {recentlyReadItems?.length > 0 && (
        <Fragment>
          <div style={{ flex: 1, minHeight: 16 }} />
          <Link
            href="/recently"
            style={{ margin: '4px 4px', border: '1px solid black', borderRadius: 4, padding: 8 }}
          >
            最近已读文章 ({recentlyReadItems.length})
          </Link>
        </Fragment>
      )}
    </Fragment>
  );
}
