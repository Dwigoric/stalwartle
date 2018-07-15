const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false
		});
	}

	run(msg) {
		if (!msg.member) return;
		msg.member.messages = msg;
	}

};
