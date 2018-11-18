const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 5,
			description: 'Clears the music queue for the server.'
		});
	}

	async run(msg) {
		this.client.providers.default.update('music', msg.guild.id, { queue: [] });
		msg.send('<:check:508594899117932544>  ::  Successfully cleared the music queue for this server.');
	}

};
