// In memory implementation of the data backend for Board Game API
const crypto = require('crypto');

const dev = process.env.NODE_ENV !== 'production'

// User
const users = require('../users');

// Game
exports.gameIDPattern = /^[a-f0-9][a-f0-9][a-f0-9][a-f0-9]$/;
let games = {};

if (dev) {
  games = {
    aaaa: {
      id: "aaaa",
      minPlayers: 3,
      maxPlayers: 5,
      users: [
        "a0b35c96-2d9a-4ac6-b85c-b1596962780e",
        "d1896a79-3677-4e1c-8ee5-56051d36f991",
        "fde132b3-987d-403a-9899-1b03bdb29b4c"
      ],
      proposal: null,
      actions: []
    }
  };
};
exports.games = games;

exports.get_game = (gameID) => {
  return games[gameID];
};

exports.create_game = (users) => {
  const id = crypto.randomBytes(2).toString('hex');
  games[id] = {
    id,
    users,
    proposal: null,
    actions: []
  };
  return games[id];
};

// Actions
let proposal = null;

// Adds a new proposal, will return a promise that resolves when the proposal is
// accepted or rejected. Promise will also reject if another current proposal is
// already in place.
exports.add_proposal = (user, gameID, action, stateHash) => {
  if (games[gameID].proposal) {
    return Promise.reject("Proposal already in progress");
  }

  const id = crypto.randomUUID();

  proposal = {
    id,
    user,
    action,
    stateHash,
    accepts: [],
    rejects: []
  };

  const promise = new Promise((resolve, reject) => {
    proposal.resolve = resolve;
    proposal.reject = reject;
  });
  proposal.promise = promise;

  return proposal.promise;
};

exports.proposal_in_progress = (gameID) => !!games[gameID].proposal;

exports.accept_proposal = (user, id) => {
};

exports.reject_proposal = (user, id) => {
};
