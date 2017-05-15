const roomInput = document.querySelector('#input-roomcode')
const usernameInput = document.querySelector('#username')

const ui = require('./ui')
const path = require('path')
const quodyssey = require('./quodyssey')
const hostname = false
const port = false

let quiz
let gameID
let username

wireEvents();

function wireEvents() {
  document.querySelector('#bottom-right-arrow > a').addEventListener(
    'click',
    function (evt) {
      evt.preventDefault();
      if(roomInput.value && usernameInput.value) {
        join();
      }
    }
  )
}

function join() {
  gameID = roomInput.value
  username = usernameInput.value

  quiz = quodyssey(hostname, port, gameID)
  quiz.join(username).then(function() {
    connectQuiz()
  })
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
