const mongoose = require('mongoose');

const Game = mongoose.model('Game');

// Enregistrement d'un score de jeu
exports.addScore = async (req, res) => {
  const gameinbase = await new Game(req.body).save();
  res.status(201).json({ message: `Jeu enregistré` });
};

// Récupération des 10 meilleurs temps de jeu.
exports.getScores = async (req, res) => {
  const scores = await Game.find().sort({ donein: 'asc' }).limit(10);
  res.json(scores);
};
