const { Monitor } = require('@sapphire/framework');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false
		});
	}

	run(msg) {
		if (!msg.member) return;
		if (!msg.guild.settings.get('automod.antiSpam') && !msg.guild.settings.get('automod.mentionSpam')) return;
		msg.member.addMessage(msg);
	}

};
