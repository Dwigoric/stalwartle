const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, { description: 'Toggle whether your AFK status will be removed either when you talk or when you run the `s.afk` command.' });
	}

	async run(msg) {
		const afkSet = msg.author.settings.afktoggle ? ['talk', false] : [`run the \`s.afk\` command`, true];
		msg.send(`<:check:508594899117932544>   ::  Your AFK status will now be removed **when you ${afkSet[0]}**.`);
		msg.author.settings.update('afktoggle', afkSet[1]);
	}

};
