const faye = require('faye');

const client = new faye.Client(`http://localhost:3333/channel/`);

function register(channel) {
    client.subscribe(`/${channel}`, notification => {
        if (notification.type === 'question') {
            console.log('Got a new question!');
            console.log(notification.data);
        } else if (notification.type === 'scoreboard') {
            console.log('Got a scoreboard!');
            console.log(notification.data);
        }
    });
}

module.exports = {
    register
}