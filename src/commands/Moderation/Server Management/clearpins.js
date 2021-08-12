const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            permissionLevel: 7,
            description: 'Unpins all pinned messages in the text channel.',
            usage: '[TextChannel:channel]'
        });
    }

    async run(msg, [channel = msg.channel]) {
        const pinnedMessages = await channel.messages.fetchPinned(false);
        if (!pinnedMessages.size) throw `${this.client.constants.EMOTES.xmark}  ::  There are no pinned messages in ${channel}.`;
        await msg.send(`${this.client.constants.EMOTES.loading}  ::  Unpinning messages...`);
        pinnedMessages.each(pinned => pinned.unpin());
        msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully unpinned messages from ${channel}!`);
    }

};
