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
		this.client.providers.default.update('music', msg.guild.id, { queue: await this.client.providers.default.get('music', msg.guild.id).then(ms => ms.queue.splice(0, 1)) });
		msg.send('<:check:508594899117932544>  ::  Successfully cleared the music queue for this server.');
	}

};
