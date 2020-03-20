const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Retrieves Overwatch game data with a given Battle Tag.',
			extendedHelp: [
				'The default platform used by this command is PC. Other platforms include Xbox Live (`xbl`) and PlayStation Network (`psn`).',
				'Please use a subcommand from `stats`, `achievements`, or `heroes`.'
			].join('\n'),
			usage: '<stats|achievements|heroes> <BattleTag:string> [pc|xbl|psn]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async stats(msg, [battletag, platform = 'pc']) {
		let blob = await fetch(`https://owapi.net/api/v3/u/${encodeURIComponent(battletag)}/stats?platform=${platform}`);
		if (!blob.ok) throw '<:error:508595005481549846>  ::  Apologies! There was an error retrieving the data you requested. Did you check the battletag\'s spelling?';
		blob = blob.json();
		const message = await msg.channel.send('<:loading:430269209415516160>  ::  Loading stats...');

		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`Overwatch Stats: ${battletag}`));

		display.addPage(template => template);

		display.run(message);
	}

};
