'use strict'
const Helpers = use('Helpers')
const Quiz = require(Helpers.resourcesPath("quiz.json"));
let games = {};

class GameController {
	* start(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] != undefined) return response.json({"success": false});

		games[gameId] = {"round": 0};
		return response.json({"success": true, "gameId": gameId}); 
	}

	* ask(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false});

		games[gameId].round++;
		let randomizedQuestion = Math.floor(Math.random() * Object.keys(Quiz.questions).length);
		games[gameId].question = Quiz.questions[Object.keys(Quiz.questions)[randomizedQuestion]].id;
		return response.json({"success": true, "round": games[gameId].round, "question": Quiz.questions[games[gameId].question]});
	}

	* getQ(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false});
		return response.json({"success": true, "round": games[gameId].round, "question": Quiz.questions[games[gameId].question]}); 
	}

	* answer(request, response) {
		let gameId = request.param("gameId");
		let round = request.param("round");
		let answer = request.param("answer");
		if (games[gameId] == undefined || games[gameId].round != round) return response.json({"success": false});
		return response.json({"success": true, "result": answer == Quiz.answers[games[gameId].question]});
	}

	* upgrade(request, response) {
		let gameId = request.param("gameId");
		let round = request.param("round");
		if (games[gameId] == undefined || games[gameId].round != round) return response.json({"success": false});
		return response.json({"success": true, "result": "Not yet implemented. Hit Paul to speed up implementation."});
	}
}

module.exports = GameController