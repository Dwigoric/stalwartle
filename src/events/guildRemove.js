const { Event } = require('@sapphire/framework');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

const gregion = {
    'eu-central': 'Central Europe',
    'eu-west': 'Western Europe',
    hongkong: 'Hong Kong',
    'us-west': 'Western US',
    'us-east': 'Eastern US',
    'us-south': 'Southern US',
    'us-central': 'Central US'
};

module.exports = class extends Event {

    constructor(...args) {
        super(...args, { event: 'guildDelete' });
        this.hook = null;
    }

    async run(guild) {
        if (guild.player) {
            guild.player.removeAllListeners();
            guild.player.destroy();
            this.client.playerManager.players.delete(guild.id);
        }

        const regionArr = guild.region.split('-');
        if (regionArr.includes('vip')) regionArr.splice(regionArr.indexOf('vip'), 1);
        const rawRegion = regionArr.join('-');
        let region = gregion[rawRegion] || rawRegion.replace(/^./, i => i.toUpperCase());
        if (guild.region.includes('vip')) region += ' [Partnered]';

        this.hook.send(new MessageEmbed()
            .setColor(0xE74C3C)
            .setAuthor("I've been removed from a server")
            .setThumbnail(guild.iconURL({ dynamic: true, format: 'png' }))
            .setTitle(`${escapeMarkdown(guild.name)}  |  ${guild.id}`)
            .addField('Guild Owner ID', guild.ownerID, true)
            .addField('Guild Region', region, true)
            .addField('Large Guild', guild.large ? '✅' : '❌', true)
            .addField('Verified Guild', guild.verified ? '✅' : '❌', true)
            .addField('Guild Members', guild.memberCount, true)
            .addField('New Guild Count', await this.client.guildCount(), true)
            .setTimestamp()
        );
    }

    async init() {
        const { id, token } = await this.client.settings.get('guildHook');
        this.hook = new WebhookClient(id, token);
    }

};
