var express = require('express');
var router = express.Router();

var {Playedgames} = require('../models/playedgames')

/* GET home page. */
router.get('/', async function(req, res, next) {

  // const times = await Playedgames.find()
  let times = {'timestamp': Date}

  res.render('index', { title: 'Express', times });
});

module.exports = router;
