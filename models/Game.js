const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    winner: String,
    hand:  [String]
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
