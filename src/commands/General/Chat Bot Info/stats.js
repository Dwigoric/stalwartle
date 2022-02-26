const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Duration } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js');
const { uptime, loadavg } = require('os');

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
                ], true)
                .addField('⏱ Uptime', [
                    `**Host**: ${Duration.toNow(now - (uptime() * 1000))}`,
                    `**Client**: ${Duration.toNow(now - this.container.client.uptime)}`,
                    `**Total**: ${Duration.toNow(now - (process.uptime() * 1000))}`
                ], true)
                .addField('💾 Usage', [
                    `**CPU Load**: ${Math.round(loadavg()[0] * 1000) / 100}%`,
                    `**RAM Used**: ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`,
                    `**Node.js**: ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`
                ], true)]
        });
    }

};
