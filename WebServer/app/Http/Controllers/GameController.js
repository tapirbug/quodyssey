'use strict'
const Helpers = use('Helpers')
const Quiz = require(Helpers.resourcesPath("quiz.json"));
let games = {};

class GameController {
	* startGame(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] != undefined) return response.json({"success": false});

		games[gameId] = {"round": 0}
		return response.json({"success": true, "gameId": gameId}); 
	}

	* setQuestion(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false});

		games[gameId].round++;
		games[gameId].question = Math.floor(Math.random() * Object.keys(Quiz.questions).length);
		return response.json({"success": true, "round": games[gameId].round, "question": Quiz.questions[games[gameId].question]});
	}

	* getQuestion(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false});
		return response.json({"success": true, "round": games[gameId].round, "question": Quiz.questions[games[gameId].question]}); 
	}

	* getResult(request, response) {
		let questionId = request.param("questionId");
		let answer = request.param("answer");
		if (Quiz.answers[questionId] == undefined) return response.json({"success": false});
		return response.json({"success": true, "result": answer == Quiz.answers[questionId]});
	}
}

module.exports = GameController