const { Listener, Events } = require('@sapphire/framework');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.GuildCreate });
        this.hook = null;
    }

    async run(guild) {
        // Clear cache
        guild.members.cache.clear();
        guild.presences.cache.clear();
        guild.emojis.cache.clear();

        this.hook.send({
            embeds: [new MessageEmbed()
                .setColor(0x2ECC71)
                .setAuthor({ name: "I've been added to a new server!", iconURL: await guild.members.fetch(guild.ownerId).then(owner => owner.user.displayAvatarURL({ dynamic: true })) })
                .setThumbnail(guild.iconURL({ dynamic: true, format: 'png' }))
                .setTitle(`${escapeMarkdown(guild.name)}  |  ${guild.id}`)
                .addField('Guild Owner', `${guild.owner.user.tag}\n(${guild.owner.user})`, true)
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
