const crypto = require('crypto');

const dev = process.env.NODE_ENV !== 'production'

// Users DB
let users = {methods:{}};

if (dev) {
  users = {
    methods: {
      github: {
        "40592": "a0b35c96-2d9a-4ac6-b85c-b1596962780e"
      }
    },
    "a0b35c96-2d9a-4ac6-b85c-b1596962780e": {
      id:"a0b35c96-2d9a-4ac6-b85c-b1596962780e",
      nick:"kelsin",
      methods:{
        github:40592
      }
    },
    "d1896a79-3677-4e1c-8ee5-56051d36f991": {
      id:"d1896a79-3677-4e1c-8ee5-56051d36f991",
      nick:"player2"
    },
    "fde132b3-987d-403a-9899-1b03bdb29b4c": {
      id:"fde132b3-987d-403a-9899-1b03bdb29b4c",
      nick:"player3"
    },
  };
}

users.lookup_by_method = (method, id) => {
  if (users.methods[method] && users.methods[method][id]) {
    return users[users.methods[method][id]];
  }
};

users.add_method_to_user = (uuid, method, id) => {
  users.methods[method][id] = uuid;
  const user = users[uuid];
  user.methods[method] = id;
  return user;
};

users.create_new_user = (method, id, nick) => {
  const uuid = crypto.randomUUID();
  users.methods[method][id] = uuid;
  const user = {
    id: uuid,
    nick,
    methods: {
      [method]: id
    }
  };
  users[uuid] = user;
  return user;
};

module.exports = users;
