const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 7,
			description: 'Changes version of greetings in the server. Set channel via `conf` command.',
			usage: '<welcome|goodbye> <gearz|anime>',
			usageDelim: ' '
		});
	}

	async run(msg, [type, version]) {
		msg.guild.settings.update(`${type}.version`, version);
		msg.send(`<:check:508594899117932544>  ::  Updated **${type}** greetings to \`${version}\`.`);
	}

};
