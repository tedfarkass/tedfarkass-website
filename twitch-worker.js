const TWITCH_USER = 'tedfarkass';

export default {
  async fetch(request, env) {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    try {
      // Step 1 — Get an app access token
      const tokenRes = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${env.TWITCH_CLIENT_ID}&client_secret=${env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        { method: 'POST' }
      );
      const tokenData = await tokenRes.json();
      const token = tokenData.access_token;

      if (!token) {
        return new Response(
          JSON.stringify({ live: false, error: 'Could not get access token' }),
          { status: 500, headers }
        );
      }

      // Step 2 — Check if the channel is live
      const streamRes = await fetch(
        `https://api.twitch.tv/helix/streams?user_login=${TWITCH_USER}`,
        {
          headers: {
            'Client-ID': env.TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const streamData = await streamRes.json();
      const isLive = streamData.data && streamData.data.length > 0;

      return new Response(
        JSON.stringify({
          live: isLive,
          title: isLive ? streamData.data[0].title : null,
          game:  isLive ? streamData.data[0].game_name : null,
        }),
        { status: 200, headers }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ live: false, error: err.message }),
        { status: 500, headers }
      );
    }
  }
};
