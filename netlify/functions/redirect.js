const { Redis } = require('@upstash/redis');

exports.handler = async (event) => {
  console.log('Redirect called with:', event.queryStringParameters);
  
  try {
    const code = event.queryStringParameters?.code;
    
    if (!code) {
      console.error('No code provided');
      return { 
        statusCode: 400, 
        body: 'No QR code provided' 
      };
    }

    console.log('Looking up code:', code);

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const data = await redis.get(`qr:${code}`);
    console.log('Redis data:', data);
    
    if (!data) {
      console.error('QR code not found:', code);
      return { 
        statusCode: 404, 
        body: 'QR code not found' 
      };
    }

    const qr = JSON.parse(data);
    console.log('Redirecting to:', qr.destination_url);
    
    qr.scan_count = (qr.scan_count || 0) + 1;
    await redis.set(`qr:${code}`, JSON.stringify(qr));

    return { 
      statusCode: 302, 
      headers: { 
        'Location': qr.destination_url,
        'Cache-Control': 'no-cache'
      } 
    };
  } catch (error) {
    console.error('Redirect error:', error);
    return { 
      statusCode: 500, 
      body: 'Error: ' + error.message 
    };
  }
};
