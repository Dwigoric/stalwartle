const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['restart'],
			permissionLevel: 9,
			description: 'Restarts the bot, and then notifies in the same channel if the bot is up again.'
		});
	}

	async run(msg) {
		await this.client.configs.update('restart', msg.channel.id);
		await msg.send(`<a:loading:430269209415516160>  ::  Bot is restarting...`);
		process.exit();
	}

};
