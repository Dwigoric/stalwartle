const { Monitor, Duration } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (msg.author.settings.get('afkIgnore').includes(msg.channel.id)) return;
		if (await this.client.providers.default.has('afk', msg.author.id) && !msg.author.settings.get('afktoggle')) {
			const wbMsg = `<:blobwave:447713448051081216>  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
			this.client.providers.default.delete('afk', msg.author.id);
			msg.send(wbMsg).catch(() => msg.author.send(wbMsg).catch());
		}

		const afkUsers = await this.client.providers.default.getKeys('afk');
		const afkUser = msg.mentions.users.filter(us => afkUsers.includes(us.id)).first();
		if (!afkUser) return;
		const afk = await this.client.providers.default.get('afk', afkUser.id);
		msg.send([
			`<:blobping:449750900098203649>  ::  ${msg.author}, **${afkUser.username}** is currently AFK. [Last seen ${Duration.toNow(afk.timestamp)} ago]`,
			afk.reason ? `**Reason**: ${afk.reason}` : ''
		].join('\n'));
	}

};
