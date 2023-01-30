const crypto = require('crypto');
const fastify = require('fastify')({ logger: true });
const oauthPlugin = require('@fastify/oauth2')
const oauth = require('./oauth');
const users = require('./users');
const data = require('./data/memory');

// Variables
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000;
const host = dev ? `http://127.0.0.1:${port}` : 'https://boardgameapi.com';

const logins = {};

// Sensible
fastify.register(require('@fastify/sensible'))

// Websocket
fastify.register(require('@fastify/websocket'))

// JWT
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  sign: {
    iss: 'boardgameapi.com',
    aud: 'boardgameapi.com',
    expiresIn: "1day"
  },
  formatUser: jwt => users[jwt.sub]
});

fastify.decorate("auth", (request, reply) => {
  return request.jwtVerify().catch(err => {
    reply.unauthorized();
  });
})

if (process.env.GITHUB_CLIENT_ID) {
  logins['github'] = `${host}/login/github`;

  if (!users.methods.github) {
    users.methods['github'] = {};
  }
  oauth.register_github_oauth(fastify, host);
}

fastify.get('/', (request, reply) => {
  reply.send({ hello: 'world' });
});

fastify.get('/login', (request, reply) => {
  reply.send({ methods: logins });
});

fastify.get('/user', {onRequest: [fastify.auth]}, (request, reply) => {
  reply.send(request.user);
});

if (dev) {
  fastify.get('/users', (request, reply) => {
    reply.send(users);
  });
  fastify.get('/games', (request, reply) => {
    reply.send(data.games);
  });
}


const userSockets = {};
fastify.register((fastify, opts, done) => {
  fastify.addHook('preValidation', (request, reply) => {
    // check if the game exists
    const { gameID } = request.params;

    if (!data.gameIDPattern.test(gameID)) {
      return reply.badRequest();
    }

    const game = data.get_game(gameID);
    if (!game) {
      return reply.notFound();
    }

    if (!game.users.includes(request.user.id)) {
      return reply.unauthorized();
    }
  });

  fastify.get('/game/:gameID', {
    onRequest: [fastify.auth],
    websocket: true
  }, (connection, req) => {
    fastify.log.info({user:req.user, msg:"new websocket connection"});

    // Save socket for use by user
    userSockets[req.user.id] = connection.socket;

    connection.socket.on('message', message => {
      connection.socket.send('hi from server');
    });

    connection.socket.on('close', () => {
      delete userSockets[req.user.id];
    });
  });
  done();
});

// Run the server!
fastify.listen({ port }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
