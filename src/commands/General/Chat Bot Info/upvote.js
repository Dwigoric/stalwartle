const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            description: 'Sends upvote links of listing sites.',
            requiredClientPermissions: ['EMBED_LINKS']
        });
    }

    async messageRun(msg) {
        if (!this.container.client.application.botPublic) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  **${this.container.client.user.tag}** is not public.`);
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setAuthor({ name: `Upvote ${this.container.client.user.username}`, iconURL: this.container.client.user.displayAvatarURL({ dynamic: true }) })
                .setDescription([
                    'Aside from donations, you can support me by simply upvoting me on bot listing sites!',
                    `• [DiscordBotList.org](https://discordbots.org/bot/${this.container.client.user.id}/vote)`,
                    `• [DiscordBotList.com](https://discordbotlist.com/bots/${this.container.client.user.id}/upvote)`,
                    `• [Bots on Discord](https://bots.ondiscord.xyz/bots/${this.container.client.user.id})`,
                    'Thank you!'
                ].join('\n'))]
        }
        );
    }

};
