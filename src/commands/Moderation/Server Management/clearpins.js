const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredUserPermissions: ['MANAGE_GUILD'],
            description: 'Unpins all pinned messages in the text channel.'
        });
        this.usage = '[TextChannel:channel]';
    }

    async messageRun(msg, args) {
        const channel = await args.pick('guildTextChannel').catch(() => msg.channel);

        const pinnedMessages = await channel.messages.fetchPinned(false);
        if (!pinnedMessages.size) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There are no pinned messages in ${channel}.`);
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Unpinning messages...`);
        pinnedMessages.each(pinned => pinned.unpin());
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully unpinned messages from ${channel}!`);
    }

};
