import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    let count;

    if (req.method === 'POST') {
      const body = req.body || {};
      const visitorId = body.visitorId;

      if (!visitorId || typeof visitorId !== 'string') {
        return res.status(400).json({ error: 'Missing visitorId' });
      }

      const added = await redis.sadd('vc:visitors', visitorId);
      if (added === 1) {
        count = await redis.incr('vc:page_views');
      } else {
        count = await redis.get('vc:page_views');
      }
    } else {
      count = await redis.get('vc:page_views');
    }

    if (count === null) count = 0;
    return res.status(200).json({ count });
  } catch (err) {
    console.error('API /api/viewcounter error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
