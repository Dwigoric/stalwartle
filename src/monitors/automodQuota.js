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
		if (!msg.guild.settings.automod.autoMute) return null;
		if (msg.author.bot && msg.guild.settings.automod.ignoreBots) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.automod.ignoreMods) return null;
		if (msg.guild.settings.automod.filterIgnore.antiSpam.includes(msg.channel.id)) return null;

		if (msg.member.actions.length < 5) return null;
		if (msg.channel.postable) msg.channel.send(`${msg.author} made 5 actions within 5 minutes, which is punishable by automated mute.`);

		const duration = await this.client.arguments.get('time').run('10m', '', msg);
		return this.client.commands.get('mute').run(msg, [msg.member, duration, 'Reached automod quota'], true)
			.then(() => {
				this.client.finalizers.get('modlogging').run({
					command: this.client.commands.get('mute'),
					channel: msg.channel,
					guild: msg.guild
				}, [msg.author, 'Reached automod quota', duration]);
			})
			.catch(err => msg.send(err));
	}

};
