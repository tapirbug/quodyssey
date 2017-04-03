'use strict'
const Helpers = use('Helpers')
const Quiz = require(Helpers.resourcesPath("quiz.json"));
let games = {};

class GameController {
	* start(request, response) {
		let gameId = request.param("gameId", -1);
		if (gameId == -1) {
			gameId = Math.floor(Math.random() * 9000 + 1000);
			while (games[gameId] != undefined) gameId = Math.floor(Math.random() * 9000 + 1000);
		}
		if (gameId < 1000 || gameId > 9999) return response.json({"success": false, "error": "Wrong ID format."});
		if (games[gameId] != undefined) return response.json({"success": false, "error": "ID unavailable."});
		games[gameId] = {"roundId": 0, "rounds": [], "scoreboard": []};
		return response.json({"success": true, "gameId": gameId}); 
	}

	* ask(request, response) {
		let gameId = request.param("gameId");
		if (games[gameId] == undefined) return response.json({"success": false, "error": "Game not found."});

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
		if (games[gameId] == undefined) return response.json({"success": false, "error": "Game not found."});
		let game = games[gameId];
		let round = game.rounds[game.roundId];
		if (round == undefined || round.end < new Date()) return response.json({"success": false, "error": "No question available."});
		let remainingTime = round.end.getTime() - new Date().getTime();
		return response.json({"success": true, "round": game.roundId, "question": Quiz.questions[round.question], "end": remainingTime}); 
	}

	* answer(request, response) {
		let gameId = request.param("gameId");
		let roundId = request.param("roundId");
		let answer = request.param("answer");
		if (games[gameId] == undefined) return response.json({"success": false, "error": "Game not found."});
		if (games[gameId].rounds[roundId] == undefined) return response.json({"success": false, "error": "Round not found."});
		let game = games[gameId];
		let round = game.rounds[roundId];
		if (round.end < new Date()) return response.json({"success": false, "error": "Round over."});
		let type = Quiz.questions[round.question].type;
		round.participants++;
		if (type == "choice") {
			round[answer]++;
			if (answer == Quiz.answers[round.question]) round.correct++;
			return response.json({"success": true});
		} else if (type == "estimate") {
			if (round.min == undefined || answer < round.min) round.min = answer;
			if (round.max == undefined || answer > round.max) round.max = answer;
			if (Math.abs(Quiz.answers[round.question] - answer) < Quiz.answers[round.question] * 0.1) round.correct++;
			return response.json({"success": true});
		}
	}

	* resultQ(request, response) {
		let gameId = request.param("gameId");
		let roundId = request.param("roundId");
		if (games[gameId] == undefined) return response.json({"success": false, "error": "Game not found."});
		if (games[gameId].rounds[roundId] == undefined) return response.json({"success": false, "error": "Round not found."});
		let round = games[gameId].rounds[roundId];
		if (round.end > new Date()) return response.json({"success": false, "error": "Round not over."});
		let type = Quiz.questions[round.question].type;
		let answer = Quiz.answers[round.question];
		return response.json({"success": true, "answer": answer, "result": round});
	}

	* resultA(request, response) {
		let gameId = request.param("gameId");
		let roundId = request.param("roundId");
		if (games[gameId] == undefined) return response.json({"success": false, "error": "Game not found."});
		if (games[gameId].rounds[roundId] == undefined) return response.json({"success": false, "error": "Round not found."});
		let round = games[gameId].rounds[roundId];
		if (round.end > new Date()) return response.json({"success": false, "error": "Round not over."});
		return response.json({"success": true, "result": round.correct == 0 ? 0 : round.correct / round.participants});
	}
}

module.exports = GameController