const faye = require('faye');

function attachFaye(server, domain) {
    new faye.NodeAdapter({ mount: domain }).attach(server);
    this.client = new faye.Client(`http://localhost:3333${domain}`);
}

function sendNotification(channel, notification) {
    if (channel && notification && this.client) return !!this.client.publish(`/${channel}`, notification);
    else return false;
}

module.exports = {
    attachFaye,
    sendNotification
}