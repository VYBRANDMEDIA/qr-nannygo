const { Redis } = require('@upstash/redis');

exports.handler = async () => {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('Upstash credentials missing');
      return { statusCode: 200, body: JSON.stringify({ qrcodes: [] }) };
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    let codes = [];
    try {
      codes = await redis.smembers('qr:all');
      if (!codes) codes = [];
    } catch (e) {
      console.error('Redis smembers error:', e);
      codes = [];
    }

    const qrcodes = [];
    for (const code of codes) {
      try {
        const data = await redis.get(`qr:${code}`);
        if (data) {
          qrcodes.push(JSON.parse(data));
        }
      } catch (e) {
        console.error(`Error fetching qr:${code}:`, e);
      }
    }

    qrcodes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrcodes }) 
    };
  } catch (error) {
    console.error('List QR error:', error);
    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrcodes: [], error: error.message }) 
    };
  }
};
