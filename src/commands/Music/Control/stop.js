const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			runIn: ['text'],
			description: 'Stops the music session in the server and empties the music queue.'
		});
	}

	async run(msg) {
		if (!msg.guild.me.voice.channel) throw `${this.client.constants.EMOTES.xmark}  ::  There is no music session in this server.`;
		this.store.get('play').timeouts.delete(msg.guild.id);
		this.client.playerManager.leave(msg.guild.id);
		msg.guild.music.reset('queue');
		// eslint-disable-next-line max-len
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully ended the music session for this server, and the queue has been emptied.`);
	}

};
