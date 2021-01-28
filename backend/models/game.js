const mongoose = require('mongoose');

const playedgames = new mongoose.Schema({
  gamername: {
    type: String,
  },
  donein: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Game', playedgames);
