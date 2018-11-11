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
		await this.client.settings.update([['restart.channel', msg.channel.id], ['restart.timestamp', msg.createdTimestamp]]);
		await msg.sendLocale('COMMAND_REBOOT').catch(err => this.client.emit('error', err));
		await this.client.destroy();
		exec('pm2 restart Stalwartle').catch(() => process.exit());
	}

};
