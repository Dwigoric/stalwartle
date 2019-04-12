const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Uses the "This is beautiful" meme by Grunkle Stan from Gravity Falls.',
			extendedHelp: 'By default, if you do not provide a user, your avatar will be used.',
			usage: '[Beautiful:user]'
		});
	}

	async run(msg, [beautiful = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.beautiful(beautiful.displayAvatarURL()), 'beautiful.png');
		message.delete();
	}

};
