const { Command } = require('klasa');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'Gives the amount of time the bot has been online.'
		});
	}

	async run(msg) {
		const now = moment(new Date());
		const uptime = moment(new Date() - this.client.uptime);
		const sinceUp = moment.duration(now.diff(uptime));
		const upDays = sinceUp.days();
		const upHours = sinceUp.hours();
		const upMins = sinceUp.minutes();
		const upSecs = sinceUp.seconds();
		msg.send(`⏱  ::  The bot has been up for ${upDays} day${upDays === 1 ? '' : 's'}, ${upHours} hour${upHours === 1 ? '' : 's'}, ${upMins} minute${upMins === 1 ? '' : 's'}, and ${upSecs} second${upSecs === 1 ? '' : 's'}.`); // eslint-disable-line max-len
	}

};
