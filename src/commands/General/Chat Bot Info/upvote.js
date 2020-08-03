const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Sends upvote links of listing sites.',
			requiredPermissions: ['EMBED_LINKS']
		});
	}

	async run(msg) {
		if (!this.client.application.botPublic) throw `${this.client.constants.EMOTES.xmark}  ::  **${this.client.user.tag}** is not public.`;
		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(`Upvote ${this.client.user.username}`, this.client.user.displayAvatarURL())
			.setDescription([
				'Aside from donations, you can support me by simply upvoting me on bot listing sites!',
				`• [DiscordBotList.org](https://discordbots.org/bot/${this.client.user.id}/vote)`,
				`• [DiscordBotList.com](https://discordbotlist.com/bots/${this.client.user.id}/upvote)`,
				`• [botlist.space](https://botlist.space/bot/${this.client.user.id})`,
				`• [Bots on Discord](https://bots.ondiscord.xyz/bots/${this.client.user.id})`,
				'Thank you!'
			])
		);
	}

};
