const express = require('express');
const Game = require('../models/Game.js');
const router = express.Router();

router.get('/new', async (req, res, next) => {
    try {
      const url = 'http://deckofcardsapi.com/api/deck/new/';
  
      // Make a GET request to the Deck of Cards API
      http.get(url, (response) => {
        let data = '';
  
        // A chunk of data has been received.
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        // The whole response has been received.
        response.on('end', () => {
          // Parse the API response
          const apiResponse = JSON.parse(data);
          const deckId = apiResponse.deck_id;
  
          // You can do something with the deck ID, send it in the response, etc.
          res.json({ deckId });
        });
      });
    } catch (err) {
      // Pass the error to the error-handling middleware
      next(err);
    }
  });
  
  module.exports = router;