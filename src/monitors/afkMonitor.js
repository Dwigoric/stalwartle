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
		if (msg.author.afk.get('isAfk') && !msg.author.settings.get('afktoggle')) {
			const wbMsg = `<:blobwave:447713448051081216>  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`;
			msg.author.afk.destroy();
			msg.send(wbMsg).catch(() => msg.author.send(wbMsg).catch());
		}

		const afkUsers = [...this.client.gateways.get('afk').cache.filter(us => us.afk.get('isAfk')).keys()];
		const afkUser = msg.mentions.users.filter(us => afkUsers.includes(us.id)).first();
		if (!afkUser) return;
		const { reason, timestamp } = afkUser.afk;
		msg.send([
			`<:blobping:449750900098203649>  ::  ${msg.author}, **${await msg.guild.members.fetch(afkUser.id).then(mb => mb.displayName).catch(() => afkUser.username)}** is currently AFK. [Last seen ${Duration.toNow(timestamp)} ago]`, // eslint-disable-line max-len
			reason ? `**Reason**: ${reason}` : ''
		].join('\n'));
	}

};
