const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreBots: false,
			ignoreOthers: false
		});
	}

	async run(msg) {
		if (!msg.guild) return null;
		if (!msg.guild.settings.get('automod.antiSpam')) return null;
		if (msg.author.bot && msg.guild.settings.get('automod.ignoreBots')) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.get('automod.ignoreMods')) return null;
		if (msg.guild.settings.get('automod.filterIgnore.antiSpam').includes(msg.channel.id)) return null;
		if (msg.author.equals(this.client.user)) return null;

		if (msg.member.messages.length <= 5) return null;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No spamming allowed, or I'll punish you!`);
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.member.messages.forEach(message => message.delete().catch(() => null));

		const duration = await this.client.arguments.get('time').run('5m', '', msg);
		return this.client.commands.get('mute').run(msg, [msg.member, duration, 'Spamming with AntiSpam enabled'], true).catch(err => msg.send(err));
	}

};
