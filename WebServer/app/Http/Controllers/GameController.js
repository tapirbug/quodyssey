'use strict'
const Helpers = use('Helpers')
const Quiz = require(Helpers.resourcesPath("quiz.json"));
let games = {};

class GameController {
	* start(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] != undefined) return response.json({"success": false});

		games[gameId] = {"roundId": 0, "rounds": []};
		return response.json({"success": true, "gameId": gameId}); 
	}

	* ask(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false});

		games[gameId].roundId++;
		let keys = Object.keys(Quiz.questions);
		let randomizedQuestion = keys[Math.floor(Math.random() * keys.length)];

		let type = Quiz.questions[randomizedQuestion].type;
		let date = new Date();
		date.setSeconds(date.getSeconds() + 20);
		if (type == "choice") {
			games[gameId].rounds[games[gameId].roundId] = {"question": randomizedQuestion, "participants": 0, "correct": 0, "a": 0, "b": 0, "c": 0, "d": 0, "end": date};
		} else if (type == "estimate") {
			games[gameId].rounds[games[gameId].roundId] = {"question": randomizedQuestion, "participants": 0, "correct": 0, "max": undefined, "min": undefined, "end": date};
		}
		return response.json({"success": true, "round": games[gameId].roundId, "question": randomizedQuestion});
	}

	* getQ(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false});
		let game = games[gameId];
		let round = game.rounds[game.roundId];
		return response.json({"success": true, "round": game.roundId, "question": Quiz.questions[round.question], "end": round.end}); 
	}

	* answer(request, response) {
		let gameId = request.param("gameId");
		let roundId = request.param("roundId");
		let answer = request.param("answer");
		if (games[gameId] == undefined || games[gameId].rounds[roundId] == undefined) return response.json({"success": false});
		let game = games[gameId];
		let round = game.rounds[roundId];
		let type = Quiz.questions[round.question].type;
		round.participants++;
		if (type == "choice") {
			round[answer]++;
			let correct = answer == Quiz.answers[round.question];
			if (correct) round.correct++;
			return response.json({"success": true, "result": correct});
		} else if (type == "estimate") {
			if (round.min == undefined || answer < round.min) round.min = answer;
			if (round.max == undefined || answer > round.max) round.max = answer;
			let correctMin = Quiz.answers[round.question] * 0.9;
			let correctMax = Quiz.answers[round.question] * 1.1;
			let correct = answer >= correctMin && answer <= correctMax;
			if (correct) round.correct++;
			return response.json({"success": true, "result": correct});
		}
	}

	* upgrade(request, response) {
		let gameId = request.param("gameId");
		let roundId = request.param("roundId");
		if (games[gameId] == undefined || games[gameId].rounds[roundId] == undefined) return response.json({"success": false});
		let round = games[gameId].rounds[roundId];
		if (new Date() < round.end) {
			return response.json({"success": false});
		} else {
			return response.json({"success": true, "result": round.correct / round.participants});
		}
	}
}

module.exports = GameController