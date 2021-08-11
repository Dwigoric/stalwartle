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
		if (msg.author.afk.get('timestamp') && !msg.author.settings.get('afktoggle')) {
			const wbMsg = `${this.client.constants.EMOTES.blobwave}  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
			msg.author.afk.reset();
			msg.send(wbMsg).catch(() => msg.author.send(wbMsg).catch());
		}

		const afkUsers = this.client.gateways.afk.cache;
		const afkUser = msg.mentions.users.filter(us => afkUsers.has(us.id)).first();
		if (!afkUser) return;
		const { reason, timestamp } = afkUser.afk;
		msg.send([
			`${this.client.constants.EMOTES.blobping}  ::  ${msg.author}, **${await msg.guild.members.fetch(afkUser.id).then(mb => mb.displayName).catch(() => afkUser.username)}** is currently AFK. [Last seen ${Duration.toNow(timestamp)} ago]`, // eslint-disable-line max-len
			reason ? `**Reason**: ${reason}` : ''
		].join('\n'), { disableMentions: 'everyone' });
	}

};
