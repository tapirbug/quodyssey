const faye = require('faye');

const client = new faye.Client(`http://${window.location.host}:63546/channel/`);

function register(channel, callbackQuestion, callbackScoreboard) {
    client.subscribe(`/${channel}`, notification => {
        if (notification.type === 'question') {
            console.log('Got a new question!');
            console.log(notification.data);
            if(callbackQuestion) {
              console.log({
                  id: notification.data.question.id,
                  round: notification.data.round,
                  type: notification.data.question.type,
                  prompt: notification.data.question.question,
                  options: [
                      notification.data.question.a,
                      notification.data.question.b,
                      notification.data.question.c,
                      notification.data.question.d
                  ],
                  duration: notification.data.end,
                  end: new Date((new Date()).getTime() + notification.data.end),
                  start: new Date(),
              })
              callbackQuestion({
                  id: notification.data.question.id,
                  round: notification.data.round,
                  type: notification.data.question.type,
                  prompt: notification.data.question.question,
                  options: [
                      notification.data.question.a,
                      notification.data.question.b,
                      notification.data.question.c,
                      notification.data.question.d
                  ],
                  duration: notification.data.end,
                  end: new Date((new Date()).getTime() + notification.data.end),
                  start: new Date(),
              })
            }
        } else if (notification.type === 'scoreboard') {
            console.log('Got a scoreboard!');
            console.log(notification.data);
            if(callbackScoreboard) {
              callbackScoreboard(notification.data)
            }
        }
    });
}

module.exports = {
    register
}
