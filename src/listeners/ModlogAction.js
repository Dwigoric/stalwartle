const { Listener } = require('@sapphire/framework');
const { Duration } = require('@sapphire/time-utilities');
const { toTitleCase } = require('@sapphire/utilities');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: 'modlogAction' });

        this.configs = {
            kick: [0xFBA200, '👢'],
            ban: [0x800000, this.container.constants.EMOTES.blobban],
            softban: [0x3498DB, '❌💬'],
            unban: [0xB5CD3B, this.container.constants.EMOTES.blobok],
            mute: [0xFFD700, this.container.constants.EMOTES.blobstop],
            unmute: [0x24E4D0, this.container.constants.EMOTES.blobgo],
            warn: [0xB2884D, this.container.constants.EMOTES.blobthinkstare]
        };
    }

    async run(action, moderator, user, guild, { reason, content = '', channel, duration, banDays = 0 } = {}) {
        if (this.container.stores.get('gateways').get('guildGateway').get(guild.id).automod.quota) {
            const automodAction = this.checkAutomodQuota(action, moderator, await guild.members.fetch(user.id).catch(() => null), channel);
            if (['warn', 'kick', 'mute', 'ban', 'softban'].includes(automodAction)) this.container.client.emit('modlogAction', automodAction, this.container.client.user, user, guild, { channel, reason: 'Reached automod quota', duration, content });
        }

        switch (action) {
            case 'ban':
                this.#ban(guild, user, banDays, reason, duration);
                break;
            case 'unban':
                this.#unban(guild, user, reason);
                break;
            case 'softban':
                await this.#ban(guild, user, banDays, { reason });
                this.#unban(guild, user, reason);
                break;
            case 'kick':
                this.#kick(guild, user, reason);
                break;
            case 'mute':
                this.#mute(guild, await guild.members.fetch(user.id, { cache: false }), reason, duration);
                break;
            case 'unmute':
                this.#unmute(await guild.members.fetch(user.id, { cache: false }), reason);
                break;
        }

        user
            .send(`You have been ${action}${action.slice(-3) === 'ban' ? 'n' : ''}${action.slice(-1) === 'e' ? '' : 'e'}d in **${guild.name}**. ${reason ? `**Reason**: ${reason}` : ''}`)
            .catch(() => {
                if (action === 'warn' && moderator.id !== this.container.client.user.id) channel.send(`⚠ I couldn't send messages to **${user.tag}**, so I couldn't warn them; but this will still be logged.`);
            });
        const { modlogs } = await this.container.stores.get('gateways').get('modlogGateway').get(guild.id);
        const modlogChannel = guild.channels.cache.get(this.container.stores.get('gateways').get('guildGateway').get(guild.id).modlogs[action]);
        if (!modlogChannel && this.container.stores.get('gateways').get('guildGateway').get(guild.id).logging && moderator.id !== this.container.client.user.id) {
            return channel.send([
                `⚠ It seems that the modlog channel for ${action}s is not yet set.`,
                `If you want to continue without logging in the future without this warning, you can use \`${this.container.stores.get('gateways').get('guildGateway').get(guild.id).prefix}conf set logging false\`.`,
                `This does not mean that I will stop the logs. You can always view them at \`${this.container.stores.get('gateways').get('guildGateway').get(guild.id).prefix}modlogs\`.`
            ].join(' '));
        }

        let message = null;
        if (this.container.stores.get('gateways').get('guildGateway').get(guild.id).logging && modlogChannel) {
            if (!channel.postable) return channel.send(`${this.container.constants.EMOTES.xmark}  ::  It seems that I cannot send messages in ${modlogChannel}.`);
            const embed = new MessageEmbed()
                .setColor(this.configs[action][0])
                .setTitle(`Case #${modlogs.length + 1}: ${toTitleCase(action)} ${this.configs[action][1]}`)
                .setFooter({ text: `User ID: ${user.id}` })
                .setTimestamp()
                .addField('Moderator', moderator, true)
                .addField(user.bot ? 'Bot' : 'User', user, true);
            if (reason) embed.addField('Reason', reason, true);
            if (duration) embed.addField('Duration', duration === Infinity ? '∞' : Duration.toNow(duration), true);
            if (moderator.id === this.container.client.user.id) {
                embed.addField('Channel', channel, true);
                if (this.container.stores.get('gateways').get('guildGateway').get(guild.id).modlogShowContent) embed.addField('Content', content > 900 ? `${content.substring(0, 900)}...` : content);
            }
            message = (await modlogChannel.send({ embeds: [embed] })).id;
        }

        modlogs.push({
            id: (modlogs.length + 1).toString(),
            message,
            moderator: moderator.id,
            reason,
            timestamp: Date.now(),
            type: action,
            user: user.id
        });
        return this.container.stores.get('gateways').get('modlogGateway').update(guild.id, 'modlogs', modlogs);
    }

    checkAutomodQuota(actionDone, actionDoer, member, channel) {
        if (!member) return null;
        if (!['unban', 'unmute'].includes(actionDone) && actionDoer.id !== this.container.client.user.id) this.container.cache.members.get(member.id).addAction(actionDone);

        const { limit, duration, action, within } = this.container.stores.get('gateways').get('guildGateway').get(member.guild.id).automod.options.quota;
        if (this.container.cache.members.get(member.id).actions.length >= limit) {
            if (channel.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) channel.send(`${member.user} made ${limit} actions within ${within} minutes, which is punishable by a ${duration}-minute automated ${action}.`);
            this.container.cache.members.get(member.id).resetActions();
            return action;
        }
        return this.container.cache.members.get(member.id).length >= limit;
    }

    async #ban(guild, user, days, reason, duration) {
        const options = { days };
        if (reason) options.reason = reason;
        if (duration && duration !== Infinity) {
            this.container.tasks.create('Unban', {
                user: user.id,
                guild: guild.id
            }, duration.getTime() - Date.now());
        }

        return guild.members.ban(user, options);
    }

    async #unban(guild, user, reason) {
        return guild.members.unban(user, reason);
    }

    async #kick(guild, user, reason) {
        return guild.members.kick(user, reason);
    }

    async #mute(guild, member, reason, duration) {
        if (duration && duration !== Infinity) {
            this.container.tasks.create('Unmute', {
                user: member.id,
                guild: guild.id
            }, duration.getTime() - Date.now());
        }

        return member.disableCommunicationUntil(duration, reason);
    }

    async #unmute(member, reason) {
        return member.disableCommunicationUntil(null, reason);
    }

};
