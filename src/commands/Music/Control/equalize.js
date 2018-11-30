const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			aliases: ['eq'],
			description: 'Equalizes the song player using bands and gains.',
			extendedHelp: [
				'There are 15 bands (`0` to `14`) that can be changed.',
				'**Gain** is the multiplier for the given band. The default value of gain each band is `0`.',
				'Valid values range from `-0.25` to `1.0`, where `-0.25` means the given band is completely muted, and `0.25` means it is doubled.',
				'\nModifying the gain could also change the volume of the output.'
			].join('\n'),
			usage: '<Band:integer{0,14}> <Gain:number{-0.25,1.0}>',
			usageDelim: ' '
		});
	}

	async run(msg, [band, gain]) {
		msg.guild.player.setEQ([{ gain, band }]);
		return msg.send(`<:check:508594899117932544>  ::  Successfully equalized band \`#${band}\`'s gain to \`${gain}\`.`);
	}

};
