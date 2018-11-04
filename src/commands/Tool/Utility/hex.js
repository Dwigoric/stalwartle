const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Converts your RGB value to its HEX code equivalent.',
			usage: '<R:integer> <G:integer> <B:integer>',
			usageDelim: ', '
		});
	}

	async run(msg, [...rgb]) {
		const [red, grn, blu] = rgb;

		function rgbToHex(rd, gn, bl) {
			return `#${((1 << 24) + (rd << 16) + (gn << 8) + bl).toString(16).slice(1)}`;
		}
		try {
			msg.send(`\`${rgb.join(', ')}\` has the HEX code of \`${rgbToHex(red, grn, blu)}\`.`);
		} catch (err) {
			msg.send(`<:crossmark:508590460688924693>  ::  Invalid color RGB value!`);
		}
	}

};
