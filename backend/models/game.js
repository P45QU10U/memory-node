const mongoose = require('mongoose')

const playedgames = new mongoose.Schema({
  gamername: {
    type: String
  },
  donein: {
    type: Number,
    required: true
  }
})


playedgames.statics.getTopScores = function() {

  return this.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$starttime" } },
        moyennedetemps: {
          $avg: "$starttime"
        }
      }
    }
  ],)
 
 
}


module.exports = mongoose.model('Game', playedgames)