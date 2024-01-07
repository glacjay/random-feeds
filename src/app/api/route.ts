import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

import api2, { FEVER_API_ENDPOINT } from '@/utils/api2';

const MAX_TRY = 42;

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');

    const response = await fetch(
      FEVER_API_ENDPOINT + '/reader/api/0/subscription/list?output=json',
      {
        headers: { Authorization: `GoogleLogin auth=${token}` },
      },
    );
    const json = await response.json();
    const allSubscriptions = (json as any).subscriptions || [];

    for (let i = 0; i < MAX_TRY && allSubscriptions.length > 0; i++) {
      const randomSubscription = allSubscriptions.splice(
        Math.floor(Math.random() * allSubscriptions.length),
        1,
      )[0];
      const feedUrl = randomSubscription.id?.replace(/^feed\//, '');
      console.log('feedUrl', feedUrl);

      try {
        const fetchingConfig = {};
        if (process.env.PROXY) {
          fetchingConfig['agent'] = new HttpsProxyAgent(process.env.PROXY);
        }
        const response = await fetch(feedUrl, fetchingConfig);
        const status = await response.status;
        if (status !== 200) {
          return new Response(JSON.stringify({ brokenFeed: randomSubscription }), {
            headers: { 'content-type': 'application/json; charset=UTF-8' },
          });
        }
      } catch (ex) {
        return new Response(JSON.stringify({ brokenFeed: randomSubscription, ex }), {
          headers: { 'content-type': 'application/json; charset=UTF-8' },
        });
      }
    }

    return new Response(JSON.stringify({}), {
      headers: { 'content-type': 'application/json; charset=UTF-8' },
    });
  } catch (ex) {
    return new Response(JSON.stringify({ ex }), {
      headers: { 'content-type': 'application/json; charset=UTF-8' },
    });
  }
}
