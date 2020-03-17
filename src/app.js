const Stalwartle = require('./lib/structures/StalwartleClient');
const { config, token } = require('./config');

new Stalwartle(config).login(token);
