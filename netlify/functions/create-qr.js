const { getStore } = require('@netlify/blobs');

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, url } = JSON.parse(event.body);

    if (!name || !url) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Name and URL are required' })
      };
    }

    const store = getStore({
      name: 'qrcodes',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_TOKEN || context.netlifyToken
    });
    
    const code = generateCode();

    const qrData = {
      code: code,
      name: name,
      destination_url: url,
      scan_count: 0,
      created_at: new Date().toISOString()
    };

    await store.set(code, JSON.stringify(qrData));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code,
        trackableUrl: `/r/${code}`
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
