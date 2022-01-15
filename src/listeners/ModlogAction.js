const { Listener } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');
const { toTitleCase } = require('@sapphire/utilities');
const { MessageEmbed } = require('discord.js');

const configs = {
    kick: ['#FBA200', '👢'],
    ban: ['#800000', '<:blobBan:399433444670701568>'],
    softban: ['#3498DB', '❌💬'],
    unban: ['#B5CD3B', '<:blobok:398843279665528843>'],
    mute: ['#FFD700', '<:blobstop:446987757651361813>'],
    unmute: ['#24E4D0', '<:blobgo:398843278243528707>'],
    warn: ['#B2884D', '<:blobthinkstare:398843280135028738>']
};

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: 'modlogAction' });
    }

    async run(message, user, reason, duration) {
        if (this.container.client.gateways.guilds.get(message.guild.id).automod.quota) this.checkAutomodQuota(message, await message.guild.members.fetch(user.id).catch(() => null));
        user
            .send(`You have been ${message.command.name}${message.command.name.slice(-3) === 'ban' ? 'n' : ''}${message.command.name.slice(-1) === 'e' ? '' : 'e'}d in **${message.guild}**. ${reason ? `**Reason**: ${reason}` : ''}`) // eslint-disable-line max-len
            .catch(() => {
                if (message.command.name === 'warn' && message.author) message.send(`⚠ I couldn't send messages to **${user.tag}**, so I couldn't warn them; but this will still be logged.`);
            });
        const moderator = message.author ? message.author.equals(user) ? this.container.client.user : message.author : this.container.client.user;
        const { modlogs } = await this.container.client.gateways.modlogs.get(message.guild.id);
        const channel = message.guild.channels.cache.get(this.container.client.gateways.guilds.get(message.guild.id).modlogs[message.command.name]);
        if (!channel && this.container.client.gateways.guilds.get(message.guild.id).logging && message.author) {
            return message.send([
                `⚠ It seems that the modlog channel for ${message.command.name}s is not yet set.`,
                `If you want to continue without logging in the future without this warning, you can use \`${this.container.client.gateways.guilds.get(message.guild.id).prefix}conf set logging false\`.`,
                `This does not mean that I will stop the logs. You can always view them at \`${this.container.client.gateways.guilds.get(message.guild.id).prefix}modlogs\`.`
            ].join(' '));
        }

        let logMessage = { id: null };
        if (this.container.client.gateways.guilds.get(message.guild.id).logging && channel) {
            if (!channel.postable) return message.send(`${this.container.constants.EMOTES.xmark}  ::  It seems that I cannot send messages in ${channel}.`);
            const embed = new MessageEmbed()
                .setColor(configs[message.command.name][0])
                .setTitle(`Case #${modlogs.length + 1}: ${toTitleCase(message.command.name)} ${configs[message.command.name][1]}`)
                .setFooter(`User ID: ${user.id}`)
                .setTimestamp()
                .addField('Moderator', moderator, true)
                .addField(user.bot ? 'Bot' : 'User', user, true);
            if (reason) embed.addField('Reason', reason, true);
            if (duration) embed.addField('Duration', duration === Infinity ? '∞' : Duration.toNow(duration), true);
            if (message.content) {
                embed.addField('Channel', message.channel, true);
                if (this.container.client.gateways.guilds.get(message.guild.id).modlogShowContent) embed.addField('Content', message.content > 900 ? `${message.content.substring(0, 900)}...` : message.content);
            }
            logMessage = await channel.send(embed);
        }

        modlogs.push({
            id: (modlogs.length + 1).toString(),
            message: logMessage.id,
            moderator: moderator.id,
            reason,
            timestamp: Date.now(),
            type: message.command.name,
            user: user.id
        });
        return this.container.client.gateways.modlogs.update(message.guild.id, { modlogs });
    }

    async checkAutomodQuota(message, member) {
        if (!member) return null;
        if (!['unban', 'unmute'].includes(message.command.name) && message.author && !message.author.bot) member.addAction(message.command.name);

        const { limit, duration, action, within } = this.container.client.gateways.guilds.get(message.guild.id).automod.options.quota;
        if (this.container.client.cache.members.get(member.id).actions.length >= limit) {
            if (message.channel.postable) message.channel.send(`${member.user} made ${limit} actions within ${within} minutes, which is punishable by a ${duration}-minute automated ${action}.`);
            await member.resetActions();

            const actionDuration = duration ? await this.container.client.arguments.get('time').run(`${duration}m`, '', message) : null;
            switch (action) {
                case 'warn': return this.container.client.emit('modlogAction', {
                    command: this.container.client.commands.get('warn'),
                    channel: message.channel,
                    guild: message.guild,
                    content: message.content
                }, member.user, 'Reached automod quota', null);
                case 'kick': return this.container.client.commands.get('kick').run(message, [member.user, ['Reached automod quota']]).catch(err => message.send(err));
                case 'mute': return this.container.client.commands.get('mute').run(message, [member, actionDuration, 'Reached automod quota'], true).catch(err => message.send(err));
                case 'ban': return this.container.client.commands.get('ban').run(message, [member.user, null, actionDuration, ['Reached automod quota']], true).catch(err => message.send(err));
                case 'softban': return this.container.client.commands.get('softban').run(message, [member.user, null, ['Reached automod quota']]).catch(err => message.send(err));
            }
        }
        return this.container.client.cache.members.get(member.id).length >= limit;
    }

};
