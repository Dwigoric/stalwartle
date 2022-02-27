const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            requiredClientPermissions: ['MANAGE_ROLES'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Unmutes a mentioned user.'
        });
    }

    async messageRun(msg, args) {
        let member = await args.pickResult('member');
        if (!member.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the member to be unmuted.`);
        member = member.value;
        const reason = await args.rest('string').catch(() => null);

        if (!this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'muteRole')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The mute role has not yet been set up for this server. You can do so by using the \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}muterole\` command.`); // eslint-disable-line max-len
        if (member.user.id === msg.author.id) return reply(msg, 'Look... how are you able to use this command if you were already unmuted?');
        if (member.user.id === this.container.client.user.id) return reply(msg, '*Unmutes self*. Oh, I would not have been able to respond if I were in the first place!');

        const user = await this.container.client.users.fetch(member.id).catch(() => null);
        const muteRole = msg.guild.roles.cache.get(this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'muteRole'));
        if (!muteRole) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Whoops! The mute role has been deleted. Please reconfigure this server's mute role by using the \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}muterole\` command.`); // eslint-disable-line max-len
        if (muteRole.position >= msg.guild.me.roles.highest.position) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The mute role **${muteRole.name}** is higher than me, so I can't take from ${user.tag} the mute role.`); // eslint-disable-line max-len
        if (!member.roles.cache.has(muteRole.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  ${user.tag} wasn't muted already!`);

        await member.roles.remove(muteRole, 'Unmuted');
        const { muted } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        muted.splice(muted.indexOf(member.user.id), 1);
        await this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, 'muted', muted);

        const task = this.container.tasks.tasks.filter(tk => tk.taskName === 'unmute' && tk.data.user === user.id)[0];
        if (task) this.container.tasks.delete(task.id);

        msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been unmuted. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, user, reason);
    }

};
