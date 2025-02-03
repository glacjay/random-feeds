import dayjs from 'dayjs';
import Link from 'next/link';
import React from 'react';

import { loadRecentlyReadItems } from '../api/actions';

export default async function Page() {
  const recentlyReadItems = await loadRecentlyReadItems();

  return (
    <div className="flex-column" style={{ paddingBottom: 4 }}>
      <div style={{ margin: '4px 4px 0' }}>最近已读文章：{recentlyReadItems?.length}</div>

      {recentlyReadItems
        ?.filter((item) => item)
        .map((item) => (
          <div
            key={item.id}
            style={{
              margin: 4,
              marginBottom: 0,
              border: '1px solid black',
              borderRadius: 4,
              padding: 8,
            }}
          >
            <Link href={`/item?id=${item.id}`}>
              <div>{item.title}</div>
              <div
                className="flex-row align-center"
                style={{
                  marginTop: 8,
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'gray',
                }}
              >
                <div>
                  {item.origin?.title} | {item.author}
                </div>
                <div>{dayjs(item.updated * 1000).format('YYYY-MM-DD HH:mm')}</div>
              </div>
            </Link>
            <div
              className="flex-row align-center"
              style={{ marginTop: 8, justifyContent: 'flex-end' }}
            ></div>
          </div>
        ))}
    </div>
  );
}
