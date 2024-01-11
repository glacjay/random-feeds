'use client';

import { useQuery } from 'react-query';
import { useToken } from 'src/data';

export default function BrokenFeeds() {
  const [token] = useToken();
  const { data, isLoading } = useQuery(
    'brokenFeed',
    async () => {
      const response = await fetch('/api/broken-feeds', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.brokenFeed;
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Broken Feeds</h1>
      <div>
        original url:{' '}
        <a href={data?.htmlUrl} target="_blank" rel="noreferrer">
          {data?.title}
        </a>
      </div>
      <div>
        feed url:{' '}
        <a href={data?.feedUrl} target="_blank" rel="noreferrer">
          {data?.feedUrl}
        </a>
      </div>
      <div>{JSON.stringify(data)}</div>
    </div>
  );
}
