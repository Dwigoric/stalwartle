const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Sends an image of the color you provide.',
			extendedHelp: [
				'To get a color, you can use its name; but if you want more accurate results, please use its hex, rgb, or rgba codes.',
				'To use hex codes, the format must be something like this: `#40E0D0`',
				'To use rgb codes, the format must be something like this: `rgb(64, 224, 208)`',
				'To use rgba codes, the format must be something like this: `rgba(64, 224, 208, .65)`',
				'If you provide an invalid name/code, the result will be black.'
			].join('\n'),
			usage: '<ColorCode:string>'
		});
	}

	async run(msg, [color]) {
		const message = await msg.send('<a:loading:430269209415516160>  ::  Loading image...');
		await msg.channel.sendFile(await this.client.idiot.colour(color), 'color.png');
		message.delete();
	}

};
