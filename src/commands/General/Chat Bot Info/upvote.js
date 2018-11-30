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
		if (!this.client.application.botPublic) throw `<:error:508595005481549846>  ::  **${this.client.user.tag}** is not public.`;
		return msg.sendEmbed(new MessageEmbed()
			.setAuthor(`Upvote ${this.client.user.username}`, this.client.user.displayAvatarURL())
			.setDescription([
				'Aside from donations, you can support me simply by upvoting me on bot listing sites!',
				`• [Discord Bot List](https://discordbots.org/bot/${this.client.user.id}/vote)`,
				`• [botlist.space](https://botlist.space/bot/${this.client.user.id})`,
				`• [Bots on Discord](https://bots.ondiscord.xyz/bots/${this.client.user.id})`,
				'Thank you!'
			])
		);
	}

};
