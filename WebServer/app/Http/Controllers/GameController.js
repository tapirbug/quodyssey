'use strict'
const Helpers = use('Helpers')
const Questions = require(Helpers.resourcesPath("questions.json"));

class GameController {
	* getQuestion (request, response) {
		let chosenId = Math.floor(Math.random() * Questions.length);
		return response.json(Questions[chosenId]); 
	}
}

module.exports = GameController
