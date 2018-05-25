const { Monitor, Duration } = require('klasa');

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			ignoreOthers: false,
			ignoreEdits: false
		});
	}

	async run(msg) {
		if (await this.client.providers.default.has('afk', msg.author.id) && !msg.author.configs.afktoggle) {
			const wbMsg = `Welcome back, **${msg.author}**! I've removed your AFK status.`;
			const userAfk = await this.client.providers.default.get('afk', msg.author.id);
			this.client.providers.default.delete('afk', msg.author.id);
			msg.send(wbMsg).catch(() => this.client.channels.get(userAfk.channel).send(wbMsg).catch());
		}

		const afkUsers = await this.client.providers.default.getKeys('afk');
		const afkUser = msg.mentions.users.filter(us => afkUsers.includes(us.id)).first();
		if (!afkUser) return;
		const afk = await this.client.providers.default.get('afk', afkUser.id);
		const afkMsg = `**${afkUser.username}** is currently AFK. [Last seen ${Duration.toNow(afk.timestamp)} ago]`;
		let afkReason;
		if (afk.reason) afkReason = `**Reason**: ${afk.reason}`;
		else afkReason = '';
		msg.reply(`${afkMsg}\n${afkReason}`);
	}

};
