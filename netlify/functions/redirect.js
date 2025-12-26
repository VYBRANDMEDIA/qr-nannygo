const { Redis } = require('@upstash/redis');

exports.handler = async (event) => {
  try {
    const code = event.queryStringParameters.code;
    if (!code) return { statusCode: 400, body: 'No code' };

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const data = await redis.get(`qr:${code}`);
    if (!data) return { statusCode: 404, body: 'Not found' };

    const qr = JSON.parse(data);
    qr.scan_count = (qr.scan_count || 0) + 1;
    await redis.set(`qr:${code}`, JSON.stringify(qr));

    return { statusCode: 302, headers: { 'Location': qr.destination_url } };
  } catch (error) {
    return { statusCode: 500, body: 'Error' };
  }
};
