const roomInput = document.querySelector('#input-roomcode')
const usernameInput = document.querySelector('#username')

const ui = require('./ui')
const path = require('path')
const quodyssey = require('./quodyssey')
const hostname = false
const port = false

const showStatsDelayMs = 3000

let quiz
let gameID
let username
let statsTimeout

wireEvents();

function wireEvents() {
  document.querySelector('#bottom-right-arrow > a').addEventListener(
    'click',
    function (evt) {
      evt.preventDefault()
      if(roomInput.value && usernameInput.value) {
        join()
      }
    }
  )
}

function join() {
  gameID = roomInput.value
  username = usernameInput.value

  quiz = quodyssey(hostname, port, gameID)
  quiz.join(username).then(function() {
    ui.showWaitingForNextRound()
    connectQuiz()
  })
}

function connectQuiz () {
  ui.showRoomcode(gameID)

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
  let answer

  // Immediately sign up for newer questions
  quiz.getNextQuestion().then(showQuestion)
  ui.showQuestion(question)

  ui.processAnswer = function (answerObj) {
    answer = answerObj
    return quiz.answer(answer)
  }

  if(statsTimeout) {
    clearTimeout(statsTimeout)
  }

  const questionTimeMs = quiz.getCurrentQuestionRemainingTime()

  statsTimeout = setTimeout(function () {
    quiz.getResultForQuiz(question.round).then(function(results) {
      if(!answer) {
        // If user did nothing, show statistics immediately
        ui.showStats(question, undefined, results)
      } else {
        // If did answer, first show simple feedback and show statistics after a delay
        setTimeout(() => ui.showStats(question, answer, results), showStatsDelayMs)
      }
    })
  }, questionTimeMs)
}
