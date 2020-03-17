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
		if (this.client.gateways.afk.get(msg.author.id) && !msg.author.settings.get('afktoggle')) {
			const wbMsg = `<:blobwave:447713448051081216>  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
			this.client.gateways.afk.get(msg.author.id).destroy();
			msg.send(wbMsg).catch(() => msg.author.send(wbMsg).catch());
		}

		const afkUsers = [...this.client.gateways.afk.cache.keys()];
		const afkUser = msg.mentions.users.filter(us => afkUsers.includes(us.id)).first();
		if (!afkUser) return;
		const { reason, timestamp } = this.client.gateways.afk.get(afkUser.id);
		msg.send([
			`<:blobping:449750900098203649>  ::  ${msg.author}, **${await msg.guild.members.fetch(afkUser.id).then(mb => mb.displayName).catch(() => afkUser.username)}** is currently AFK. [Last seen ${Duration.toNow(timestamp)} ago]`, // eslint-disable-line max-len
			reason ? `**Reason**: ${reason}` : ''
		].join('\n'));
	}

};
