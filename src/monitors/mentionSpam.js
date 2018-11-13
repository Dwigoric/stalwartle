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
		if (!msg.guild.settings.get('automod.mentionSpam')) return null;
		if (msg.author.bot && msg.guild.settings.get('automod.ignoreBots')) return null;
		if (await msg.hasAtLeastPermissionLevel(6) && msg.guild.settings.get('automod.ignoreMods')) return null;
		if (msg.guild.settings.get('automod.filterIgnore.mentionSpam').includes(msg.channel.id)) return null;
		if (msg.author.equals(this.client.user)) return null;

		if (msg.member.messages.length && msg.member.messages
			.map(message => message.mentions.users ? message.mentions.users.size : 0 + message.mentions.roles ? message.mentions.roles.size : 0)
			.reduce((prev, val) => prev + val) < 10) return null;
		if (msg.channel.postable) msg.channel.send(`Hey ${msg.author}! Don't spam mentions, ${msg.author}. Got it, ${msg.author}?`);
		if (!msg.member.bannable) {
			return this.client.emit('modlogAction', {
				command: this.client.commands.get('warn'),
				channel: msg.channel,
				guild: msg.guild,
				content: msg.content.length > 900 ? [
					`**Roles**: ${msg.member.messages.map(message => message.mentions.roles.map(rl => rl.toString()).join(', ')).join(', ')}`,
					`**Users**: ${msg.member.messages.map(message => message.mentions.users.map(us => us.toString()).join(', ')).join(', ')}`
				].join('\n') : msg.content
			}, msg.author, 'Spamming mentions with the MentionSpam enabled (member has higher permissions so I could not ban them)', null);
		} // eslint-disable-line max-len
		if (msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) msg.member.messages.forEach(message => message.delete().catch(() => null));
		return this.client.commands.get('ban')
			.run(msg, [msg.author, null, await this.client.arguments.get('time').run('30m', '', msg), 'Mention spamming with MentionSpam enabled'], true)
			.catch(err => msg.send(err));
	}

};
