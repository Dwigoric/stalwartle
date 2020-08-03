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
		if (!msg.guild.me.voice.channelID) throw `${this.client.constants.EMOTES.xmark}  ::  There is no music session in this server.`;
		this.client.playerManager.leave(msg.guild.id);
		if (await this.client.providers.default.get('music', msg.guild.id).then(music => music.queue[0] && music.queue[0].requester === this.client.user.id)) this.client.providers.default.update('music', msg.guild.id, { queue: [] }); // eslint-disable-line max-len
		// eslint-disable-next-line max-len
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully ended the music session for this server. If you want, you can use \`${msg.guild.settings.get('prefix')}clear\` to clear the queue.`);
	}

};
