const { Command, Store } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Stopwatch } = require('@sapphire/stopwatch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['r'],
            preconditions: ['OwnersOnly'],
            description: 'Reloads a piece, or all pieces of a store.'
        });
    }

    async messageRun(message, args) {
        const piece = await args.pick('store').catch(() => args.pick('piece').catch(() => 'everything'));

        if (piece === 'everything') return this.#everything(message);
        if (piece instanceof Store) {
            const timer = new Stopwatch();
            await piece.loadAll();
            if (piece.init) await piece.init();
            if (this.container.client.shard) {
                await this.container.client.shard.broadcastEval(`
                    if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.name}').loadAll().then(() => {
                        const store = this.container.stores.get('${piece.name}');
                        if (store.init) store.init();
                    });
                `);
            }
            return reply(message, `${this.container.constants.EMOTES.tick}  ::  Reloaded all ${piece.name}. (Took ${timer.stop()})`);
        }

        try {
            const itm = await piece.reload().then(() => piece.store.get(piece.name));
            const timer = new Stopwatch();
            if (this.container.client.shard) {
                await this.client.shard.broadcastEval(`
                    if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').reload();
                `);
            }
            return reply(message, `${this.container.constants.EMOTES.tick}  ::  Reloaded \`${itm.name}\` from ${itm.store.name}. (Took ${timer.stop()})`);
        } catch (err) {
            piece.store.set(piece);
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Failed to reload \`${piece.name}\` from ${piece.store.name}. Please check your console.`);
        }
    }

    async #everything(message) {
        const timer = new Stopwatch();
        await Promise.all(this.container.stores.map(async (store) => {
            await store.loadAll();
            if (store.init) await store.init();
        }));
        if (this.container.client.shard) {
            await this.container.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.map(async (store) => {
                    await store.loadAll();
                    if (store.init) await store.init();
                });
            `);
        }
        return reply(message, `${this.container.constants.EMOTES.tick}  ::  Reloaded everything. (Took ${timer.stop()})`);
    }

};
