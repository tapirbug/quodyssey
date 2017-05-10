const roomInput = document.querySelector('#input-roomcode')
const usernameInput = document.querySelector('#username')

const quodyssey = require('./quodyssey')
const hostname = false
const port = false

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
  const room = roomInput.value
  const username = usernameInput.value

  const quiz = quodyssey(hostname, port, room)
  quiz.join(username).then(function() {
    localStorage.setItem('roomcode', room)
    localStorage.setItem('username', username)
    window.location = 'quizplayer.html'
  })
}
