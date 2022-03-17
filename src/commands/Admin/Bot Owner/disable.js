const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['OwnersOnly'],
            description: 'Re-enables or temporarily disables a piece. Default state restored on reboot.'
        });
        this.usage = '<Piece:piece>';
        this.guarded = true;
    }

    async messageRun(message, args) {
        const piece = await args.pick('piece').catch(() => null);
        if (piece === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Please supply the name of the piece you want to disable.`);

        piece.enabled = false;
        if (this.container.client.shard) {
            await this.container.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').enabled = false;
            `);
        }
        return reply(message, `${this.container.constants.EMOTES.tick}  ::  Successfully disabled \`${piece.name}\` from ${piece.store.name}.`);
    }

};
