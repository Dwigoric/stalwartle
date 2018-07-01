const { Monitor, Duration } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (msg.author.configs.afkIgnore.includes(msg.channel.id)) return;
		if (await this.client.providers.get('json').has('afk', msg.author.id) && !msg.author.configs.afktoggle) {
			const wbMsg = `<:blobwave:447713448051081216>  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
			const userAfk = await this.client.providers.get('json').get('afk', msg.author.id);
			this.client.providers.get('json').delete('afk', msg.author.id);
			msg.send(wbMsg).catch(() => this.client.channels.get(userAfk.channel).send(wbMsg).catch());
		}

		const afkUsers = await this.client.providers.get('json').getKeys('afk');
		const afkUser = msg.mentions.users.filter(us => afkUsers.includes(us.id)).first();
		if (!afkUser) return;
		const afk = await this.client.providers.get('json').get('afk', afkUser.id);
		msg.send([
			`<:blobping:449750900098203649>  ::  ${msg.author}, **${afkUser.username}** is currently AFK. [Last seen ${Duration.toNow(afk.timestamp)} ago]`,
			afk.reason ? `**Reason**: ${afk.reason}` : ''
		].join('\n'));
	}

};
