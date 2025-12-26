const { Redis } = require('@upstash/redis');

exports.handler = async (event) => {
  try {
    const code = event.queryStringParameters.code;
    if (!code) return { statusCode: 400, body: 'Invalid code' };

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const data = await redis.get(`qr:${code}`);
    if (!data) return { statusCode: 404, body: 'QR code not found' };

    const qrcode = JSON.parse(data);
    qrcode.scan_count = (qrcode.scan_count || 0) + 1;
    await redis.set(`qr:${code}`, JSON.stringify(qrcode));

    return {
      statusCode: 302,
      headers: { 'Location': qrcode.destination_url, 'Cache-Control': 'no-cache' }
    };
  } catch (error) {
    return { statusCode: 500, body: 'Error' };
  }
};
