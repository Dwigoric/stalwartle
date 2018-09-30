const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['achieve'],
			requiredPermissions: ['ATTACH_FILES'],
			description: 'Gives someone (or you) a Minecraft achievement!',
			extendedHelp: [
				'To make an achievement, provide a text.',
				'If you want to give someone an achievement, provide their user tag, username, nickname, user ID, or mention them.',
				'If you mentioned someone and gave a text, the bot will make an achievement using the text your provide. e.g. `s.achieve @Stalwartle for being the greatest bot on Discord`'
			].join('\n'),
			usage: '[Achiever:user] <AchievementText:string> [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [achiever = msg.author, ...achievement]) {
		const trim = (str, max) => str.length > max ? str.slice(0, max) : str;
		msg.channel.sendFile(await this.client.idiot.achievement(achiever.displayAvatarURL(), trim(achievement.join(this.usageDelim), 22)), 'achievement.png');
	}

};
