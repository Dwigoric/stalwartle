const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['fear'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Uses the "I Fear No Man" meme by the character Pyro from Team Fortress 2\'s promotional video.',
			extendedHelp: 'By default, if you do not provide a user, your avatar will be used.',
			usage: '[HeavyFear:user]'
		});
	}

	async run(msg, [fear = msg.author]) {
		msg.channel.sendFile(await this.client.idiot.heavyFear(fear.displayAvatarURL()), 'heavyfear.png');
	}

};
