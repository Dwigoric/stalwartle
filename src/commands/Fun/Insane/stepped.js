const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['step'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Ew... I stepped in sh*t. Please note that this is for meme purposes only.',
			extendedHelp: [
				'By default, if you do not provide a user, your avatar will be used.',
				'***Do not use this to cyberbully someone. If you see someone, go to my dev server using `s.hub` and report so we can blacklist the user.***'
			].join('\n\n'),
			usage: '[Stepped:user]'
		});
	}

	async run(msg, [stepped = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.stepped(stepped.displayAvatarURL({ format: 'png', size: 2048 })), 'stepped.png');
		message.delete();
	}

};
