const express = require('express');
const Game = require('../models/Game.js');
const { addListener } = require('nodemon');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Front Page' });
});


router.get('/score', async function(req, res, next) {
  const games = await Game.find()
  //counts how many times each person has won
  const counters = {
    dealer: 0,
    player: 0
  };

  games.forEach(game=> {
    if(game.winner == "dealer") counters.dealer++;
    else counters.player++;

  })

  res.json(counters);

});

router.post('/score', async function(req, res, next) {
  const {winner, hand} = req.body;
  await Game.create({winner, hand});

  res.json({status: 0, message: "Created record"});
});

module.exports = router;
