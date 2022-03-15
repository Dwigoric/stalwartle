const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['OwnersOnly'],
            description: 'Re-enables or temporarily enables a piece. Default state restored on reboot.'
        });
        this.usage = '<Piece:piece>';
    }

    async messageRun(message, args) {
        const piece = await args.pick('piece').catch(() => null);
        if (piece === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Please supply the name of the piece you want to enable.`);

        piece.enabled = true;
        if (this.container.client.shard) {
            await this.container.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').enabled = true;
            `);
        }
        return reply(message, `${this.container.constants.EMOTES.tick}  ::  Successfully enabled \`${piece.name}\` to ${piece.store.name}.`);
    }

};
