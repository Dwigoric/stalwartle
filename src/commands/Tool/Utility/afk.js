const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Marks you as AFK. Supplying a reason is optional.',
			extendedHelp: [
				"If someone mentions you, I will inform them that you are AFK (if you are), including how long you've been AFK.",
				'If you want me to ignore a channel for you from AFK stuff, just use `s.userconf set afkIgnore <channel>`. Note that this applies only for you.'
			],
			usage: '[Reason:string]'
		});
	}

	async run(msg, [reason = null]) {
		if (msg.author.afk.get('timestamp') && msg.author.settings.get('afktoggle')) {
			await msg.author.afk.reset();
			return msg.send(`${this.client.constants.EMOTES.blobwave}  ::  Welcome back, **${msg.author}**! I've removed your AFK status.`);
		}

		if (typeof reason === 'string' && reason.length > 1024) throw `${this.client.constants.EMOTES.xmark}  ::  Your AFK reason is too long! Please try to shorten it.`;
		await msg.author.afk.update([['reason', reason], ['timestamp', Date.now()]]);
		if (msg.guild && msg.guild.me.permissions.has('MOVE_MEMBERS') && msg.member.voice.channel && msg.guild.settings.get('afkChannelOnAfk') && msg.guild.afkChannelID) msg.member.voice.setChannel(msg.guild.afkChannelID, 'Moved to AFK channel due to AFK status'); // eslint-disable-line max-len
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  ${msg.author}, I've set you as AFK. ${reason ? `**Reason**: ${reason}` : ''}`);
	}

};
