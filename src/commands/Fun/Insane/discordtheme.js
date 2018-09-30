const { Command } = require('klasa');
const { MessageAttachment } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Because dark theme > light theme.',
			requiredPermissions: ['ATTACH_FILES'],
			extendedHelp: "The image wasn't made for discrimination nor was it made by my creator. All credits goes to the image artist."
		});
	}

	async run(msg) {
		msg.send({ files: [new MessageAttachment('https://cdn.glitch.com/e7d1d8f7-c2e1-4ca4-809e-08c278683e0d%2Fimage-55.png')] });
	}

};
