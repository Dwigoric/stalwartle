const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['MANAGE_ROLES', 'MANAGE_CHANNELS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Mutes a mentioned user.',
            detailedDescription: 'To mute a user indefinitely, simply do not provide the duration.'
        });
    }

    async messageRun(msg, args, force) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be muted.`);
        member = member.value;
        const duration = await args.pick('duration').catch(() => Infinity);
        const reason = await args.rest('string').catch(() => null);

        if (!msg.guild.settings.get('muteRole')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`); // eslint-disable-line max-len
        if (!force && member.user.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Why would you mute yourself?`);
        if (!force && member.user.id === this.container.client.user.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Have I done something wrong?`);

        const user = await this.container.client.users.fetch(member.id).catch(() => null);
        const muteRole = msg.guild.roles.cache.get(msg.guild.settings.get('muteRole'));
        if (!muteRole) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Whoops! The mute role has been deleted. Please reconfigure this server's mute role by using the \`${msg.guild.settings.get('prefix')}muterole\` command.`); // eslint-disable-line max-len
        if (muteRole.position >= msg.guild.me.roles.highest.position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The mute role **${muteRole.name}** is higher than me, so I can't give ${user.tag} the mute role.`); // eslint-disable-line max-len
        if (member.roles.cache.has(muteRole.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  ${user.tag} has been already muted!`);

        for (const channel of msg.guild.channels.cache.values()) {
            if (channel.type === 'GUILD_TEXT') channel.updateOverwrite(muteRole, { SEND_MESSAGES: false }, 'Muted');
            else if (channel.type === 'GUILD_VOICE') channel.updateOverwrite(muteRole, { SPEAK: false }, 'Muted');
            else channel.updateOverwrite(muteRole, { SEND_MESSAGES: false, SPEAK: false }, 'Muted');
        }
        await member.roles.add(muteRole, 'Muted');
        await msg.guild.settings.update('muted', member.user.id, { arrayAction: 'add' });
        if (duration && duration !== Infinity) {
            this.container.tasks.create('Unmute', {
                user: user.id,
                guild: msg.guild.id,
                role: msg.guild.settings.get('muteRole')
            }, duration.getTime() - Date.now());
        }

        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been muted. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, user, reason, duration);
    }

};
