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

          // We already have a user for this github account, log them in
          let user = users.lookup_by_method('github', body.id);

          if (!user) {
            if (request.user) {
              // If we are logged in already, add this method to the user
              user = users.add_method_to_user(request.user.id, 'github', body.id);
            } else {
              // Otherwise create a user
              user = users.create_new_user('github', body.id, body.login);
            }
          }

          reply.send({
            user,
            jwt: request.server.jwt.sign({ sub: user.id })
          });
        });

      // if later you need to refresh the token you can use
      // const newToken = await this.getNewAccessTokenUsingRefreshToken(token.refresh_token)
    }).catch(err => {
      request.server.log.error(err);
      return reply.badRequest();
    });
  });
};
