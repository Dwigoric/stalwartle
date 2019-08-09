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
		await this.client.settings.update([['restart.channel', msg.channel.id], ['restart.timestamp', msg.createdTimestamp]]);
		await msg.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit('error', err));
		await this.client.destroy();
		process.exit();
	}

};
