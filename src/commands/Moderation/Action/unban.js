const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['BAN_MEMBERS'],
            runIn: ['text'],
            description: 'Unbans a user from their ID.',
            usage: '<Member:user> [Reason:string] [...]',
            usageDelim: ' '
        });
    }

    async messageRun(msg, [user, ...reason]) {
        if (!await msg.guild.fetchBans().then(bans => bans.has(user.id))) throw `${this.container.client.constants.EMOTES.xmark}  ::  This user isn't banned from this server.`;

        reason = reason.length ? reason.join(this.usageDelim) : null;

        await msg.guild.members.unban(user, reason);
        msg.channel.send(`${this.container.client.constants.EMOTES.tick}  ::  **${user.tag}** (\`${user.id}\`) has been unbanned. ${reason ? `**Reason**: ${reason}` : ''}`);
        return this.container.client.emit('modlogAction', msg, user, reason);
    }

};
