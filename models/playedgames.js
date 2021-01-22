const mongoose = require('mongoose')

const playedgames = new mongoose.Schema({
  timestamp: {
  type: Date,
  required: true,
  default: Date.now,
  },
  gamerName: {
    type: String
  } 
})

module.exports = mongoose.model('Playedgames', playedgames)