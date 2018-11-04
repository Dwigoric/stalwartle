const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'This command is based from the anime Psycho Pass.',
			usage: '[User:user]',
			extendedHelp: [
				"A person's Crime Coefficient is a numerical measure of said person's probability/propensity to commit a crime.",
				"It is one part of a person's overall [Psycho-Pass](http://bit.ly/2CdrwCL)."
			].join('\n')
		});
	}

	async run(msg, [mentioned]) {
		const msgargs = msg.args.join(' ');
		const crimec = Math.round(Math.random() * 1000);
		if (msgargs && !mentioned) throw '<:error:508595005481549846>  ::  No person specified. Cymatic scanner was not used.';

		let results;
		if (!msgargs) {
			if (crimec < 100) results = `🔫  ::  Your Crime Coefficient is: **${crimec}/1000**.\n\nYou are not a target for enforcement action. The trigger of Dominator will be locked.`;
			if (crimec >= 100 && crimec < 300) results = `🔫  ::  Your Crime Coefficient is: **${crimec}/1000**.\n\nYou are classified as a latent criminal and are a target for enforcement action. Dominator is set to Non-Lethal Paralyzer mode. You can then be knocked out using the Dominator.`; // eslint-disable-line max-len
			if (crimec >= 300) results = `🔫  ::  Your Crime Coefficient is: **${crimec}/1000**.\n\nYou pose a serious threat to the society. Lethal force is authorized. Dominator will automatically switch to Lethal Eliminator. Suspect that is hit by Lethal Eliminator will bloat and explode.`; // eslint-disable-line max-len
		} else {
			if (crimec < 100) results = `🔫  ::  **${mentioned.tag}**'s Crime Coefficient is: **${crimec}/1000**.\n\nSuspect is not a target for enforcement action. The trigger of Dominator will be locked.`;
			if (crimec >= 100 && crimec < 300) results = `🔫  ::  **${mentioned.tag}**'s Crime Coefficient is: **${crimec}/1000**.\n\nSuspect is classified as a latent criminal and is a target for enforcement action. Dominator is set to Non-Lethal Paralyzer mode. Suspect can then be knocked out using the Dominator.`; // eslint-disable-line max-len
			if (crimec >= 300) results = `🔫  ::  **${mentioned.tag}**'s Crime Coefficient is: **${crimec}/1000**.\n\nSuspect poses a serious threat to the society. Lethal force is authorized. Dominator will automatically switch to Lethal Eliminator. Suspect that is hit by Lethal Eliminator will bloat and explode.`; // eslint-disable-line max-len
		}
		msg.send(results);
	}

};
