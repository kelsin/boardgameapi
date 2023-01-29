const crypto = require('crypto');
const oauthPlugin = require('@fastify/oauth2');

const users = require('./users');

exports.register_github_oauth = (fastify, host) => {
  fastify.register(oauthPlugin, {
    name: 'github',
    credentials: {
      client: {
        id: process.env.GITHUB_CLIENT_ID,
        secret: process.env.GITHUB_CLIENT_SECRET
      },
      auth: oauthPlugin.GITHUB_CONFIGURATION
    },

    // register a fastify url to start the redirect flow
    startRedirectPath: '/login/github',

    // github redirect here after the user login
    callbackUri: `${host}/login/github/callback`
  });

  fastify.get('/login/github/callback', (request, reply) => {
    request.server.github.getAccessTokenFromAuthorizationCodeFlow(request).then(token => {
      fetch('https://api.github.com/user', { headers: { 'Accept': 'application/vnd.github+json', 'Authorization': `Bearer ${token.token.access_token}` }})
        .then(res => res.json())
        .then(body => {
          const uuid = crypto.randomUUID();
          const user = {
            id: uuid,
            nick: body.login
          };
          users[uuid] = user;
          reply.send({
            user,
            jwt: request.server.jwt.sign({ sub: user.id })
          });
        });

      // if later you need to refresh the token you can use
      // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)
    });
  });
};
