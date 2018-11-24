const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Stops the music playing in the voice channel.'
		});
	}

	async run(msg) {
		if (this.client.player.leave(msg.guild.id)) return msg.send('<:check:508594899117932544>  ::  Successfully ended the music session for this server.');
		else throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
	}

};
