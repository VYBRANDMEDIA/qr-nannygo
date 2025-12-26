const { Redis } = require('@upstash/redis');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Not allowed' }) };
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const { name, url } = JSON.parse(event.body);
    if (!name || !url) return { statusCode: 400, body: JSON.stringify({ error: 'Name and URL required' }) };

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const qrData = { code, name, destination_url: url, scan_count: 0, created_at: new Date().toISOString() };

    await redis.set(`qr:${code}`, JSON.stringify(qrData));
    await redis.sadd('qr:all', code);

    return { statusCode: 200, body: JSON.stringify({ code }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
