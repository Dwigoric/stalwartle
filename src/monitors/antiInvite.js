const { Monitor } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (!msg.guild) return null;
		if (!msg.guild.settings.get('automod.antiInvite')) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.get('automod.ignoreMods')) return null;
		if (msg.guild.settings.get('automod.filterIgnore.antiInvite').includes(msg.channel.id)) return null;
		if (msg.author.equals(this.client.user)) return null;

		const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/i;
		if (!inviteRegex.test(msg.content)) return null;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! No sending invites allowed, or I'll punish you!`);
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.delete().catch(() => null);

		const { duration, action } = await msg.guild.settings.get('automod.options.antiInvite');
		const actionDuration = duration ? await this.client.arguments.get('time').run(`${duration}m`, '', msg) : null;
		switch (action) {
			case 'warn': return this.client.emit('modlogAction', {
				command: this.client.commands.get('warn'),
				channel: msg.channel,
				guild: msg.guild,
				content: msg.content
			}, msg.author, 'Sending invites with AntiInvite enabled', null);
			case 'kick': return this.client.commands.get('kick').run(msg, [msg.author, ['Sending invites with AntiInvite enabled']]).catch(err => msg.send(err));
			case 'mute': return this.client.commands.get('mute').run(msg, [msg.member, actionDuration, 'Sending invites with AntiInvite enabled'], true).catch(err => msg.send(err));
			case 'ban': return this.client.commands.get('ban').run(msg, [msg.author, null, actionDuration, ['Sending invites with AntiInvite enabled']], true).catch(err => msg.send(err));
			case 'softban': return this.client.commands.get('softban').run(msg, [msg.author, null, ['Sending invites with AntiInvite enabled']]).catch(err => msg.send(err));
		}
		return msg;
	}

};
