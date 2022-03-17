const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Exports the server music queue.'
        });
    }

    async messageRun(msg) {
        const { queue } = await this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!queue.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  The queue is empty. Add one using the \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}play\` command.`);

        const prompter = new MessagePrompter('📜  ::  Should the queue be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer. Otherwise, reply `none` to cancel.', 'message');
        let choice;
        do {
            if (prompter.strategy.appliedMessage) prompter.strategy.appliedMessage.delete();
            choice = await prompter.run(msg.channel, msg.author).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'none'].includes(choice.content));
        prompter.strategy.appliedMessage.delete();

        switch (choice.content) {
            case 'file': {
                if (!msg.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I do not have the permissions to attach files to this channel.`);
                return reply(msg, { files: [{ attachment: Buffer.from(queue.map(track => track.info.uri).join('\r\n')), name: 'output.txt' }], content: `${this.container.constants.EMOTES.tick}  ::  Exported the queue as file.` });
            }
            case 'haste':
            case 'hastebin': {
                const { key } = await fetch('https://www.toptal.com/developers/hastebin/documents', {
                    method: 'POST',
                    body: queue.map(track => track.info.uri).join('\r\n')
                }).then(res => res.json()).catch(() => ({ key: null }));
                if (key === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! An unknown error occurred.`);
                return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Exported the queue to hastebin: <https://www.toptal.com/developers/hastebin/${key}.stalwartle>`);
            }
            case 'none':
                reply(msg, `${this.container.constants.EMOTES.tick}  ::  Queue export cancelled!`);
        }
        return null;
    }

};
