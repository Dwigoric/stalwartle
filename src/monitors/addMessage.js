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
		if (msg.author.bot) return;
		if (!msg.guild.settings.get('automod.antiSpam') && !msg.guild.settings.get('automod.mentionSpam')) return;
		msg.member.addMessage(msg);
	}

};
