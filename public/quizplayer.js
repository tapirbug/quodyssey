//
// Entry point for question terminal logic
//

const path = require('path')
const quodyssey = require('./quodyssey')
const ui = require('./ui')
const gameID = localStorage.getItem('roomcode')
const username = localStorage.getItem('username')
const hostname = 'localhost'
const port = 3333
const quiz = quodyssey(hostname, port, gameID, username)

connectQuiz()

function initialize () {
  connectQuiz()
}

function connectQuiz () {
  ui.showRoomcode(gameID)
  ui.processAnswer = quiz.answer

  quiz.getQuestion().then(function(question) {
    if(!question) {
      // If no question available yet, wait for next
      quiz.getNextQuestion().then(showQuestion)
    } else {
      showQuestion(question)
    }
  })
}

function showQuestion(question) {
  // Immediately sign up for newer questions
  quiz.getNextQuestion().then(showQuestion)
  ui.showQuestion(question)
}
