const { Redis } = require('@upstash/redis');

exports.handler = async () => {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const codes = await redis.smembers('qr:all') || [];
    const qrcodes = await Promise.all(codes.map(async (code) => {
      const data = await redis.get(`qr:${code}`);
      return data ? JSON.parse(data) : null;
    }));

    return { statusCode: 200, body: JSON.stringify({ qrcodes: qrcodes.filter(Boolean) }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ qrcodes: [] }) };
  }
};
