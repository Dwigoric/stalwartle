const { Command, Store } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Stopwatch } = require('@sapphire/stopwatch');
const { promisify } = require('util');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['r'],
            preconditions: ['OwnersOnly'],
            description: 'Reloads a piece, or all pieces of a store.'
        });
        this.usage = '<Store:store|Piece:piece|everything:default>';
        this.guarded = true;
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('what-to-reload')
                        .setDescription('The store or piece to reload, or reload everything.'))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: ['1015446069246709871']
        });
    }

    async chatInputRun(interaction) {
        const piece = await promisify(interaction.options.getString).bind(this)('what-to-reload', true)
            .then(str => {
                try {
                    return this.container.stores.get('arguments').get('store').run(str);
                } catch (err) {
                    return this.container.stores.get('arguments').get('piece').run(str);
                }
            })
            .catch(() => 'everything');

        if (piece === 'everything') return interaction.reply(`${this.container.constants.EMOTES.tick}  ::  Reloaded everything. (Took ${await this.#everything()})`);
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
            return interaction.reply(`${this.container.constants.EMOTES.tick}  ::  Reloaded all ${piece.name}. (Took ${timer.stop()})`);
        }

        try {
            const item = await piece.reload().then(() => piece.store.get(piece.name));
            if (item.init) await item.init();
            const timer = new Stopwatch();
            if (this.container.client.shard) {
                await this.container.client.shard.broadcastEval(`
                    if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').reload();
                `);
            }
            return interaction.reply(`${this.container.constants.EMOTES.tick}  ::  Reloaded \`${item.name}\` from ${item.store.name}. (Took ${timer.stop()})`);
        } catch (err) {
            piece.store.set(piece);
            return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  Failed to reload \`${piece.name}\` from ${piece.store.name}. Please check your console.`, ephemeral: true });
        }
    }

    async messageRun(message, args) {
        const piece = await args.pick('store').catch(() => args.pick('piece').catch(() => 'everything'));

        if (piece === 'everything') return reply(message, `${this.container.constants.EMOTES.tick}  ::  Reloaded everything. (Took ${await this.#everything()})`);
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
            const item = await piece.reload().then(() => piece.store.get(piece.name));
            if (item.init) await item.init();
            const timer = new Stopwatch();
            if (this.container.client.shard) {
                await this.client.shard.broadcastEval(`
                    if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').reload();
                `);
            }
            return reply(message, `${this.container.constants.EMOTES.tick}  ::  Reloaded \`${item.name}\` from ${item.store.name}. (Took ${timer.stop()})`);
        } catch (err) {
            piece.store.set(piece);
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Failed to reload \`${piece.name}\` from ${piece.store.name}. Please check your console.`);
        }
    }

    async #everything() {
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
        return timer.stop();
    }

};
