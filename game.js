'use strict'
const express = require('express');
const quiz = require('./resources/quiz.json');
const router = express.Router();

const games = {};

router.post('/start', function(req, res, next) {
	let gameId = req.body.gameId;
	if (gameId == undefined) {
		gameId = Math.floor(Math.random() * 9000 + 1000);
		while (games[gameId] != undefined) gameId = Math.floor(Math.random() * 9000 + 1000);
	}
	if (gameId < 1000 || gameId > 9999) return res.json({'success': false, 'error': 'Wrong ID format.'});
	if (games[gameId] != undefined) return res.json({'success': false, 'error': 'ID unavailable.'});
	games[gameId] = {'roundId': 0, 'rounds': [], 'users': {}};
	return res.json({'success': true, 'gameId': gameId}); 
});

router.post('/join', function(req, res, next) {
	let gameId = req.body.gameId;
	let username = req.body.username;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	if (games[gameId].users[username] != undefined) return res.json({'success': false, 'error': 'Name unavailable.'});
	games[gameId].users[username] = {'score': 0, 'round': 0};
	return res.json({'success': true});
});

router.post('/ask', function(req, res, next) {
	let gameId = req.body.gameId;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});

	games[gameId].roundId++;
	let keys = Object.keys(quiz.questions);
	let randomizedQuestion = keys[Math.floor(Math.random() * keys.length)];

	let type = quiz.questions[randomizedQuestion].type;
	let date = new Date();
	date.setSeconds(date.getSeconds() + 20);
	if (type == 'choice') {
		games[gameId].rounds[games[gameId].roundId] = {'question': randomizedQuestion, 'participants': 0, 'correct': 0, 'a': 0, 'b': 0, 'c': 0, 'd': 0, 'end': date};
	} else if (type == 'estimate') {
		games[gameId].rounds[games[gameId].roundId] = {'question': randomizedQuestion, 'participants': 0, 'correct': 0, 'max': undefined, 'min': undefined, 'end': date};
	}
	return res.json({'success': true, 'round': games[gameId].roundId, 'question': randomizedQuestion});
});

router.get('/getQ/:gameId', function(req, res, next) {
	let gameId = req.params.gameId;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	let game = games[gameId];
	let round = game.rounds[game.roundId];
	if (round == undefined || round.end < new Date()) return res.json({'success': false, 'error': 'No question available.'});
	let remainingTime = round.end.getTime() - new Date().getTime();
	return res.json({'success': true, 'round': game.roundId, 'question': quiz.questions[round.question], 'end': remainingTime}); 
});

router.post('/answer', function(req, res, next) {
	let gameId = req.body.gameId;
	let roundId = req.body.roundId;
	let answer = req.body.answer;
	let username = req.body.username;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	if (games[gameId].rounds[roundId] == undefined) return res.json({'success': false, 'error': 'Round not found.'});
	if (games[gameId].users[username] == undefined) return res.json({'success': false, 'error': 'User not found.'});
	let game = games[gameId];
	let round = game.rounds[roundId];
	if (round.end < new Date()) return res.json({'success': false, 'error': 'Round over.'});
	let type = quiz.questions[round.question].type;
	if (games[gameId].users[username].round >= roundId) return res.json({'success': false, 'error': 'User has already answered.'});
	if (type == 'estimate' && isNaN(answer)) return res.json({'success': false, 'error': 'Answer was not a number'});
	games[gameId].users[username].round = roundId;
	round.participants++;
	if (type == 'choice') {
		round[answer]++;
		if (answer == quiz.answers[round.question]) {
			round.correct++;
			games[gameId].users[username].score++;
		}
		return res.json({'success': true});
	} else if (type == 'estimate') {
		if (round.min == undefined || answer < round.min) round.min = answer;
		if (round.max == undefined || answer > round.max) round.max = answer;
		if (Math.abs(quiz.answers[round.question] - answer) < quiz.answers[round.question] * 0.1) {	
			round.correct++;
			games[gameId].users[username].score++;
		}
		return res.json({'success': true});
	}
});

router.get('/resultQ/:gameId/:roundId', function(req, res, next) {
	let gameId = req.params.gameId;
	let roundId = req.params.roundId;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	if (games[gameId].rounds[roundId] == undefined) return res.json({'success': false, 'error': 'Round not found.'});
	let round = games[gameId].rounds[roundId];
	if (round.end > new Date()) return res.json({'success': false, 'error': 'Round not over.'});
	let type = quiz.questions[round.question].type;
	let answer = quiz.answers[round.question];
	return res.json({'success': true, 'answer': answer, 'result': round});
});

router.get('/resultA/:gameId/:roundId', function(req, res, next) {
	let gameId = req.params.gameId;
	let roundId = req.params.roundId;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	if (games[gameId].rounds[roundId] == undefined) return res.json({'success': false, 'error': 'Round not found.'});
	let round = games[gameId].rounds[roundId];
	if (round.end > new Date()) return res.json({'success': false, 'error': 'Round not over.'});
	return res.json({'success': true, 'result': round.correct == 0 ? 0 : round.correct / round.participants});
});

router.get('/scoreboard/:gameId', function(req, res, next) {
	let gameId = req.params.gameId;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	let users = games[gameId].users;
	let scoreboard = {};
	for(let key in users) {
		scoreboard[key] = users[key].score;
	};
	return res.json({'success': true, 'scoreboard': scoreboard});
});

router.post('/end', function(req, res, next) {
	let gameId = req.body.gameId;
	if (games[gameId] == undefined) return res.json({'success': false, 'error': 'Game not found.'});
	games[gameId] = undefined;
	return res.json({'success': true});
});

module.exports = router;