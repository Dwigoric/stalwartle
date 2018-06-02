const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false
		});
	}

	run(msg) {
		if (!msg.guild) return;
		msg.member.messages = msg;
	}

};
