const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Puts your avatar in a garbage can. Please note that this is for meme purposes only.',
			extendedHelp: [
				'By default, if you do not provide a user, your avatar will be used.',
				'\n***Do not use this to cyberbully someone. If you see someone, go to my dev server using `s.hub` and report so we can blacklist the user.***'
			].join('\n'),
			usage: '[Garbage:user]'
		});
	}

	async run(msg, [garbage = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.garbage(garbage.displayAvatarURL({ format: 'png', size: 2048 })), 'garbage.png');
		message.delete();
	}

};
