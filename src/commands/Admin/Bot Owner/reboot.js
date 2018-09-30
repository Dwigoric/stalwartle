const { Command, util: { exec } } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['restart'],
			permissionLevel: 9,
			description: 'Restarts the bot, and then notifies in the same channel if the bot is up again.'
		});
	}

	async run(msg) {
		await this.client.settings.update('restart', msg.channel.id);
		await msg.send(`<a:loading:430269209415516160>  ::  Bot is restarting...`);
		await this.client.destroy();
		exec('pm2 restart Stalwartle');
	}

};
