'use strict'
const Helpers = use('Helpers')
const Quiz = require(Helpers.resourcesPath("quiz.json"));

class GameController {
	* getQuestion(request, response) {
		let chosenId = Math.floor(Math.random() * Quiz.questions.length);
		return response.json(Quiz.questions[chosenId]); 
	}

	* getResult(request, response) {
		let questionId = request.param("id");
		let answer = request.param("answer");
		return response.json({"result": answer == getAnswerById(questionId)});
		//if (questionId != "" && answer != "" && answer == getAnswerById(questionId)) {
		//	return response.json({"result": true});
		//}
		//return response.json({"result": false});
	}
}

function getAnswerById(id) {
	for(let i = 0; i < Quiz.answers.length; i++) {
		if (Quiz.answers[i].id == id) return Quiz.answers[i].answer;
	}
	return null;
}

module.exports = GameController