const express = require('express');
const router = express.Router();

// Les contrôleurs gèrent les actions selon les routes appelées
const scoreController = require('../controllers/scoreController')

// Avec async await, on attrape les erreurs en englobant avec catchErrors
const { catchErrors } = require('../helpers/errorHandlers')

/* La home page */
router.get('/', async function(req, res, next) {
  res.render('index', { title: 'Memory' });
});

// Les routes qui font office d'api
router.post('/savegame', catchErrors(scoreController.addScore));
router.get('/savedgames', catchErrors(scoreController.getScores));

module.exports = router;
