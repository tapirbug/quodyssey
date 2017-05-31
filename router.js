const express = require('express');
const gameController = require('./source/gameController');
const router = express.Router();

router.get('/getQ/:gameId', gameController.getQuestion);
router.get('/resultQ/:gameId/:roundId', gameController.resultQuiz);
router.get('/resultA/:gameId/:roundId', gameController.resultAction);
router.get('/scoreboard/:gameId', gameController.scoreboard);

router.post('/start', gameController.start);
router.post('/join', gameController.join);
router.post('/ask', gameController.ask);
router.post('/answer', gameController.answer);
router.post('/end', gameController.end);

const fayeClient = require('./client/fayeClient');
fayeClient.register(6666);

module.exports = router;
