import { loadBrokenFeeds } from '../api/broken-feeds/route';

export default async function Page() {
  let brokenFeed: { htmlUrl: string; title: string; feedUrl: string } | null =
    await loadBrokenFeeds();

  return (
    <div>
      <h1>Broken Feeds</h1>
      <div>
        original url:{' '}
        <a href={brokenFeed?.htmlUrl} target="_blank" rel="noreferrer">
          {brokenFeed?.title}
        </a>
      </div>
      <div>
        feed url:{' '}
        <a href={brokenFeed?.feedUrl} target="_blank" rel="noreferrer">
          {brokenFeed?.feedUrl}
        </a>
      </div>
      <div>{JSON.stringify(brokenFeed)}</div>
    </div>
  );
}
