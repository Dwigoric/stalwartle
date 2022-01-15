const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

const pruning = new Set();

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['purge'],
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_MESSAGES'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Prunes a certain amount of messages w/o filter.',
            usage: '[Limit:integer{2,100}] [link|invite|bots|you|me|pinsonly|upload|user:user]',
            usageDelim: ' ',
            cooldown: 10
        });
    }

    async messageRun(msg, [limit = 50, filter = null]) {
        let messages = await msg.channel.messages.fetch({ limit: 1 });
        if (!messages.size) throw `${this.container.client.constants.EMOTES.xmark}  ::  The channel does not have any messages.`;

        if (pruning.has(msg.channel.id)) throw `${this.container.client.constants.EMOTES.xmark}  ::  I am currently pruning messages from this channel. Please wait until the process is done.`;
        pruning.add(msg.channel.id);

        messages = messages.concat(await msg.channel.messages.fetch({ limit, before: messages.last().id }));
        [messages] = messages.partition(message => message.id !== msg.id);
        const { size } = messages;

        if (filter) {
            const user = typeof filter !== 'string' ? filter : null;
            const type = typeof filter === 'string' ? filter : 'user';
            messages = messages.filter(this.getFilter(msg, type, user));
        }
        if (!messages.size) {
            pruning.delete(msg.channel.id);
            throw `${this.container.client.constants.EMOTES.xmark}  ::  No message matches the \`${filter}\` filter from the last \`${limit}\` messages.`;
        }
        // eslint-disable-next-line max-len
        const loadingMessage = await msg.channel.send(`${this.container.client.constants.EMOTES.loading}  ::  Deleting messages... Please note that messages older than 14 days will take time to be deleted. If possible, please refrain from deleting them manually until the purging process is complete.`);
        let deleted = 0;
        const bulkDeleted = await msg.channel.bulkDelete(messages, true);
        deleted += bulkDeleted.size;
        messages = messages.difference(bulkDeleted);
        if (messages.size) {
            await Promise.all(messages.map(async message => {
                await message.delete().catch(() => deleted--);
                return deleted++;
            }));
        }
        await msg.delete();

        pruning.delete(msg.channel.id);
        await loadingMessage.delete();
        return msg.channel.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully deleted ${deleted} messages from ${size} messages.`).then(pruneMsg => {
            setTimeout(() => pruneMsg.delete(), 5000);
        });
    }

    getFilter(msg, filter, user) {
        switch (filter) {
            case 'link':
                return mes => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
            case 'invite':
                return mes => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/i.test(mes.content);
            case 'bots':
                return mes => mes.author.bot;
            case 'you':
                return mes => mes.author.id === this.container.client.user.id;
            case 'me':
                return mes => mes.author.id === msg.author.id;
            case 'pinsonly':
                return mes => !mes.pinned;
            case 'upload':
                return mes => mes.attachments.size > 0;
            case 'user':
                return mes => mes.author.id === user.id;
            default:
                return () => true;
        }
    }

};
