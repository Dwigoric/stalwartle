const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Clears the music queue for the server.'
		});
	}

	async run(msg) {
		const { queue, playlist, history } = await this.client.providers.default.get('music', msg.guild.id);
		this.client.providers.default.update('music', msg.guild.id, { playlist, history, queue: msg.guild.player.playing ? queue.slice(0, 1) : [] }); // eslint-disable-line max-len
		msg.send('<:check:508594899117932544>  ::  Successfully cleared the music queue for this server.');
	}

};
