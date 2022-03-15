const { Command } = require('@sapphire/framework');
const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['u'],
            preconditions: ['OwnersOnly'],
            description: 'Unloads a piece.'
        });
        this.usage = '<Piece:piece>';
    }

    async messageRun(message, args) {
        let piece = await args.pickResult('piece');
        if (!piece.success) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Invalid piece.`);
        piece = piece.value;

        const prompter = new MessagePrompter(`⚠  ::  You are about to unload \`${piece.name}\` from ${piece.store.name}. Do you want to continue?`);
        const confirm = await prompter.run(message.channel, message.author);
        prompter.strategy.appliedMessage.delete();
        if (!confirm) return reply(message, `${this.container.constants.EMOTES.tick}  ::  Cancelled the unloading operation.`);

        piece.unload();
        if (this.container.client.shard) {
            await this.container.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').unload();
            `);
        }
        return reply(message, `${this.container.constants.EMOTES.tick}  ::  Unloaded piece \`${piece.name}\` from ${piece.store.name}.`);
    }

};
