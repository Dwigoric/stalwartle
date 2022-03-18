const { Listener, Events } = require('@sapphire/framework');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.GuildDelete });
        this.hook = null;
    }

    async run(guild) {
        const player = this.container.erela.get(guild.id);
        if (player) {
            player.removeAllListeners();
            this.container.erela.destroy(guild.id);
        }

        this.hook.send({
            embeds: [new MessageEmbed()
                .setColor(0xE74C3C)
                .setAuthor({ name: "I've been removed from a server" })
                .setThumbnail(guild.iconURL({ dynamic: true, format: 'png' }))
                .setTitle(`${escapeMarkdown(guild.name)}  |  ${guild.id}`)
                .addField('Guild Owner ID', guild.ownerId, true)
                .addField('Large Guild', guild.large ? '✅' : '❌', true)
                .addField('Verified Guild', guild.verified ? '✅' : '❌', true)
                .addField('Guild Members', String(guild.memberCount), true)
                .addField('New Guild Count', String(await this.container.client.guildCount()), true)
                .setTimestamp()]
        });
    }

    async init() {
        const { id, token } = this.container.client.settings.guildHook;
        this.hook = new WebhookClient({ id, token });
    }

};
