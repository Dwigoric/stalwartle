const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const { uptime, loadavg } = require('os');
const moment = require('moment-timezone');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['sts'],
            cooldownDelay: 15,
            cooldownLimit: 2,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Provides some details about the bot and stats.'
        });
    }

    async messageRun(msg) {
        const now = Date.now();
        reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor({ name: `${this.container.client.user.tag}'s Statistics 📟`, iconURL: this.container.client.user.displayAvatarURL({ dynamic: true }) })
                .setFooter({ text: `Shard ${((msg.guild ? msg.guild.shard.id : msg.channel.shardID) || this.container.client.options.shardId) + 1} / ${this.container.client.options.shardCount}` })
                .setTimestamp()
                .addField('🤖 General Information', [
                    `**Users**: ${(await this.container.client.userCount()).toLocaleString()}`,
                    `**Servers**: ${(await this.container.client.guildCount()).toLocaleString()}`,
                    `**Voice Connections**: ${Array.from(this.container.lavacord.players.values()).filter(player => player.playing).length}`
                ].join('\n'), true)
                .addField('⏱ Uptime', [
                    `**Host**: ${moment(now - (uptime() * 1000)).fromNow(true)}`,
                    `**Client**: ${moment(now - this.container.client.uptime).fromNow(true)}`,
                    `**Total**: ${moment(now - (process.uptime() * 1000)).fromNow(true)}`
                ].join('\n'), true)
                .addField('💾 Usage', [
                    `**CPU Load**: ${Math.round(loadavg()[0] * 1000) / 100}%`,
                    `**RAM Used**: ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`,
                    `**Node.js**: ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`
                ].join('\n'), true)]
        });
    }

};
