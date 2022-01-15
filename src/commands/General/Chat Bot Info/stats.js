const { Command } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');
const { MessageEmbed } = require('discord.js');
const { uptime, loadavg } = require('os');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['sts'],
            guarded: true,
            bucket: 2,
            cooldown: 15,
            requiredPermissions: ['EMBED_LINKS'],
            description: language => language.get('COMMAND_STATS_DESCRIPTION'),
            extendedHelp: language => language.get('COMMAND_STATS_EXTENDED')
        });
    }

    async messageRun(msg) {
        const now = Date.now();
        msg.sendMessage(new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(`${this.container.client.user.tag}'s Statistics 📟`, this.container.client.user.displayAvatarURL({ dynamic: true }))
            .setFooter(`Shard ${((msg.guild ? msg.guild.shard.id : msg.channel.shardID) || this.container.client.options.shardId) + 1} / ${this.container.client.options.shardCount}`)
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
            ], true));
    }

};
