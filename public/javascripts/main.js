
//stores game info
currentValues = {
  deck_id: null,
  dealer: {
    hand: [null,null],
    soft: 0,
    score: 0
  },
  player: {
    hand: [null, null],
    soft: 0,
    score: 0
  }
}

//adds card and calculates score
const addCard = (person, card) => {
  if(person.hand[0] === null) person.hand.splice(0,1)
  person.hand.push(card.code)

  let score = parseInt(card.value)
  if(card.code[0] === "K" || card.code[0] === "J" || card.code[0] === "Q" ) score = 10
  if(card.code[0] === "A"){score = 11; person.soft++}

  person.score += score
  if(person.score > 21 && person.soft > 0){person.score -= 10; person.soft--}
}

  //updates card display
  const updateCards = () => {
    const dealerCards = document.getElementById("dealerCards")
    const playerCards = document.getElementById("playerCards")
   
    dealerCards.innerHTML = ""
    playerCards.innerHTML = ""

    document.getElementById("dealerScore").innerHTML = `Dealer Score<br> ${currentValues.dealer.score}`
    document.getElementById("playerScore").innerHTML = `Player Score<br> ${currentValues.player.score}`


    currentValues.dealer.hand.forEach(card => {
      const cardElement = document.createElement("img")
      const src = card === null ? "https://i.pinimg.com/originals/40/66/44/40664440b9dcbf61bbd896b919c6b703.png" : `https://deckofcardsapi.com/static/img/${card}.png`
      cardElement.setAttribute("src", src)
      dealerCards.appendChild(cardElement)

    })

    currentValues.player.hand.forEach(card => {
      const cardElement = document.createElement("img")
      const src = card === null ? "https://i.pinimg.com/originals/40/66/44/40664440b9dcbf61bbd896b919c6b703.png" : `https://deckofcardsapi.com/static/img/${card}.png`
      cardElement.setAttribute("src", src)
      playerCards.appendChild(cardElement)

    })

  }

  //draws card through API
  const draw = async (person, count) => {
    try {
      const { cards } = await fetch(`https://deckofcardsapi.com/api/deck/${currentValues.deck_id}/draw/?count=${count}`).then(
        (res) => res.json()
      );
  
      cards.forEach((card) => {
        addCard(person, card);
      });
      updateCards();
    } catch (error) {
      console.error('Error:', error);
    }
  }

//fetches tally
const tally = async () => {
  try {
    const response = await fetch('http://localhost:3000/score');

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const { dealer, player } = data;

    document.getElementById('deal').innerHTML = 'DEALER WINS: ' + dealer;
    document.getElementById('play').innerHTML = 'PLAYER WINS: ' + player;
  } catch (error) {
    console.error('Error:', error);
  }
}

//send round results to database
const endRound = async (winner, hand) => {
  try {
    await fetch('http://localhost:3000/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ winner, hand }),
    });
    console.log('Winner:', winner);
    console.log('Hand:', hand);
  } catch (error) {
    console.error('Error:', error);
  }
}

//dealer's turn actions
const dealerTurn = async () => {
  try {
    //dealer draws cards until they hit 17
    while (currentValues.dealer.score < 17) {
      await draw(currentValues.dealer, 1);
    }
    //player wins if dealer > 21
    if (currentValues.dealer.score > 21) {
      setTimeout(function () {
        $('#winModal').modal('show');
      }, 800);
      endRound('player', currentValues.player.hand);
    } else {
      //if both under 21, player with less difference from 21 wins
      let d = 21 - currentValues.dealer.score;
      let p = 21 - currentValues.player.score;
      if (p < d) {
        setTimeout(function () {
          $('#winModal').modal('show');
        }, 800);
        endRound('player', currentValues.player.hand);
      } else if (p === d) {
        setTimeout(function () {
          $('#tieModal').modal('show');
        }, 800);
      } else {
        setTimeout(function () {
          $('#loseModal').modal('show');
        }, 800);
        endRound('dealer', currentValues.dealer.hand);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}


window.onload = function () {
  $("#startModal").modal('show')

  //resets game info
  $(document).ready(function() {
    $('.deal').on('click', async function() {
      currentValues = {
        deck_id: null,
        dealer: {
          hand: [null,null],
          soft: 0,
          score: 0
        },
        player: {
          hand: [null, null],
          soft: 0,
          score: 0
        }
      }
      //update tally, get deck, and clear modals
      tally();
      const {deck_id} = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .then(res => res.json())
      currentValues.deck_id = deck_id
      $('#startModal').modal('hide')
      $('#winModal').modal('hide')
      $('#loseModal').modal('hide')
      $('#tieModal').modal('hide')
      updateCards()
      //first turn checks for blackjack
      setTimeout(async function() { 
        await draw(currentValues.player, 2)
        await draw(currentValues.dealer, 1)
        if(currentValues.player.score == 21) {
          await draw(currentValues.dealer, 1)
          if(currentValues.dealer.score == 21) {
            setTimeout(function() {$("#tieModal").modal('show')},800)
          } else {
            setTimeout(function() {$("#winModal").modal('show')},800)
            endRound("player", currentValues.player.hand)
          }
        }
      },800)
      
    });
  });

//player draws more cards
document.getElementById("hit")
  .addEventListener("click", async function() {
    await draw(currentValues.player, 1)
    //player loses if they exceed 21
    if(currentValues.player.score > 21) {
      setTimeout(function() {$("#loseModal").modal('show')},800)
      endRound("dealer", currentValues.dealer.hand)
    }
    if(currentValues.player.score == 21) {
      dealerTurn();
    }
})

document.getElementById("stay")
  .addEventListener("click", async function() {
    dealerTurn();
})


};