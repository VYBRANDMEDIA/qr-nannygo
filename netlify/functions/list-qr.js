const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  try {
    const store = getStore({
      name: 'qrcodes',
      siteID: process.env.SITE_ID,
      token: process.env.NETLIFY_TOKEN || context.netlifyToken
    });
    
    const { blobs } = await store.list();
    
    const qrcodes = await Promise.all(
      blobs.map(async (blob) => {
        const data = await store.get(blob.key);
        return JSON.parse(data);
      })
    );

    qrcodes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrcodes })
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
