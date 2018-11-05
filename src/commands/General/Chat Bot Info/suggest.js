const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'This command is used to give suggestions for the bot.',
			usage: '<Suggestion:string>',
			extendedHelp: [
				'Suggestions include basically anything except anything silly AND suggesting something against the [Discord Guidelines](https://discordapp.com/guidelines).',
				'**These will lead to a ban from the bot.**',
				'Your suggestion is sent to my dev server that is heavily guarded by a samurai.',
				"My high lords will look into your suggestion as soon as they can and may send you a DM after it's checked."
			].join('\n')
		});
	}

	async run(msg, [suggestion]) {
		const server = msg.guild ? `${msg.guild.name} | ${msg.guild.id}` : 'None (Direct Messages)';
		this.client.channels.get('445822487385866260').send([
			`💡  ::  Suggestion by **${msg.author.tag}** | ${msg.author.id}`,
			`\t\t\tServer: ${server}`,
			`\`\`\`${suggestion}\`\`\``
		].join('\n'), { files: msg.attachments.map(a => a.url) });
		const messageOptions = msg.channel.permissionsFor(this.client.user).has('ATTACH_FILES') ?
			{ files: [{ attachment: await this.client.idiot.suggestion(msg.author.displayAvatarURL(), suggestion), name: 'suggestion.png' }] } :
			{};
		msg.send([
			`<:check:508594899117932544>  ::  I've successfully submitted your suggestion! Thank you for helping to make this bot better. 💖\n`,
			'***Please make sure I can DM (privacy settings) you so you will be updated about your suggestion.***'
		].join('\n'), messageOptions);
	}

};
