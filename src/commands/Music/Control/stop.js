const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Stops the music session in the server.'
		});
	}

	async run(msg) {
		if (!msg.guild.me.voice.channelID) throw '<:error:508595005481549846>  ::  There is no music session in this server.';
		this.client.playerManager.leave(msg.guild.id);
		await msg.guild.music.sync();
		if (msg.guild.music.get('queue')[0].requester === this.client.user.id) msg.guild.music.update('queue', []);
		return msg.send(`<:check:508594899117932544>  ::  Successfully ended the music session for this server. If you want, you can use \`${msg.guild.settings.get('prefix')}clear\` to clear the queue.`);
	}

};
