import { HttpsProxyAgent } from 'https-proxy-agent';

import { FEVER_API_ENDPOINT } from '@/utils/api2';
import { getToken } from '@/utils/token';

const MAX_TRY = 42;

export async function loadBrokenFeeds() {
  let token = getToken();

  const response = await fetch(`${FEVER_API_ENDPOINT}/reader/api/0/subscription/list?output=json`, {
    headers: { Authorization: `GoogleLogin auth=${token}` },
  });
  const json = await response.json();
  const allSubscriptions = (json as any).subscriptions || [];

  for (let i = 0; i < MAX_TRY && allSubscriptions.length > 0; i++) {
    const randomSubscription = allSubscriptions.splice(
      Math.floor(Math.random() * allSubscriptions.length),
      1,
    )[0];
    const feedUrl = randomSubscription.id?.replace(/^feed\//, '');
    randomSubscription.feedUrl = feedUrl;
    console.log('feedUrl', feedUrl);

    try {
      const fetchingConfig = {};
      if (process.env.PROXY) {
        fetchingConfig['agent'] = new HttpsProxyAgent(process.env.PROXY);
      }
      const response = await fetch(feedUrl, fetchingConfig);
      const status = await response.status;
      console.log('crawling result:', { response, status });
      if (status !== 200) {
        return randomSubscription;
      }
    } catch (ex) {
      console.warn('error:', ex);
      return randomSubscription;
    }
  }

  return null;
}
