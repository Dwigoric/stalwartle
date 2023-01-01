const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            aliases: ['ti'],
            requiredClientPermissions: ['MANAGE_GUILD'],
            description: 'Shows the top invites in a server.'
        });
    }

    async messageRun(msg) {
        const invites = await msg.guild.invites.fetch({ cache: false });
        const topTen = invites.sort((a, b) => b.uses - a.uses).first(10);
        if (topTen.size === 0) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no invites in this server!`);
        return reply(msg,
            topTen.map((inv, top) => `\`${top + 1}\`. **${inv.inviter.username}**'s invite **${inv.code}** has **${inv.uses.toLocaleString()}** use${inv.uses > 1 ? 's' : ''}.`).join('\n')
        );
    }

};
