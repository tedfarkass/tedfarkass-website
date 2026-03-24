exports.handler = async function() {
  const CLIENT_ID     = process.env.TWITCH_CLIENT_ID;
  const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
  const TWITCH_USER   = 'tedfarkass';

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    // Step 1 — Get an app access token
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      { method: 'POST' }
    );
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ live: false, error: 'Could not get access token' }),
      };
    }

    // Step 2 — Check if the channel is live
    const streamRes = await fetch(
      `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`,
      {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    const streamData = await streamRes.json();
    const isLive = streamData.data && streamData.data.length > 0;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        live: isLive,
        title: isLive ? streamData.data[0].title : null,
        game:  isLive ? streamData.data[0].game_name : null,
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ live: false, error: err.message }),
    };
  }
};
