const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rip'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Uses the "Press F to Pay Respects" meme from Call of Duty: Advanced Warfare.',
			extendedHelp: 'By default, if you do not provide a user, your avatar will be used.',
			usage: '[Respected:user]'
		});
	}

	async run(msg, [respected = msg.author]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		msg.channel.sendFile(await this.client.idiot.respect(respected.displayAvatarURL({ format: 'png', size: 2048 })), 'respect.png', 'Press 🇫 to Pay Respects')
			.then(sent => {
				message.delete();
				if (sent.channel.type !== 'text') return null;
				if (sent.guild && !sent.channel.permissionsFor(this.client.user).has('ADD_REACTIONS')) return false;
				return sent.react('🇫');
			});
	}

};
