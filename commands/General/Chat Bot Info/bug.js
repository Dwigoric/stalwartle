const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guarded: true,
			description: 'This command is used to report bugs.',
			usage: '<BugReport:string>',
			extendedHelp: 'Those who submit silly bug reports will be banned from the bot. Your bug report is escorted by a samurai to my dev server where my developers can fix the bug as soon as they can.' // eslint-disable-line max-len
		});
	}

	async run(msg, ...params) {
		const server = msg.guild ? `${msg.guild.name} | ${msg.guild.id}` : 'None (Direct Messages)';
		this.client.channels.get('445822540024381450').send([
			`🐛  ::  Bug Report by **${msg.author.tag}** | ${msg.author.id}`,
			`\t\t\tServer: ${server}`,
			`\`\`\`${params}\`\`\``
		].join('\n'), { files: msg.attachments.map(a => a.url) });
		msg.send([
			`<:greenTick:399433439280889858>  ::  I've successfully submitted your bug report! Thank you for helping to make this bot better. 💖\n`,
			'***Please make sure I can DM (privacy settings) you so you will be updated about your report.***'
		].join('\n'));
	}

};
