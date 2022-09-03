const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Stopwatch } = require('@sapphire/stopwatch');
const { codeBlock } = require('@sapphire/utilities');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['l'],
            preconditions: ['OwnersOnly'],
            description: 'Loads a piece from the bot.'
        });
        this.usage = '<Store:store> <path:string>';
        this.guarded = true;
        this.regExp = /\\\\?|\//g;
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('store')
                        .setDescription('The store to load the piece to.')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('path')
                        .setDescription('The file path of the piece you want to load.')
                        .setRequired(true))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: ['1015443736286732408']
        });
    }

    async chatInputRun(interaction) {
        const store = interaction.options.get('store');
        let path = interaction.options.get('path');
        path = (path.endsWith('.js') ? path : `${path}.js`).split(this.regExp);

        const timer = new Stopwatch();
        const piece = store.load(store.paths.values().next().value, path.join('/')).then(loaded => loaded[0]).catch(() => null);

        try {
            if (!piece) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  The file does not exist, or an error occurred while loading your file.`, ephemeral: true });
            if (piece.init) await piece.init();
            if (this.container.client.shard) {
                await this.container.client.shard.broadcastEval(`
                    if (String(this.options.shards) !== '${this.container.client.options.shards}') {
                        const piece = this.container.stores.get('${store.name}').load('${piece.directory}', ${JSON.stringify(path)});
                        if (piece && piece.init) piece.init();
                    }
                `);
            }
            return interaction.reply(`${this.container.constants.EMOTES.tick}  ::  Successfully loaded \`${piece.name}\` to ${store.name}. (Took ${timer.stop()})`);
        } catch (error) {
            timer.stop();
            return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  Failed to load to ${store.name}: \`${piece ? piece.name : path.join('/')}\`. Reason: ${codeBlock('js', error)}`, ephemeral: true });
        }
    }

    async messageRun(message, args) {
        const store = await args.pick('store').catch(() => null);
        if (store === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Please supply the store to load the piece to.`);
        let path = await args.rest('string').then(str => str.trim()).catch(() => null);
        if (path === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Please supply the file path of the piece you want to load.`);

        path = (path.endsWith('.js') ? path : `${path}.js`).split(this.regExp);
        const timer = new Stopwatch();
        const piece = await store.load(store.paths.values().next().value, path.join('/')).then(loaded => loaded[0]).catch(() => null);

        try {
            if (!piece) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The file does not exist, or an error occurred while loading your file.`);
            if (piece.init) await piece.init();
            if (this.container.client.shard) {
                await this.container.client.shard.broadcastEval(`
                    if (String(this.options.shards) !== '${this.container.client.options.shards}') {
                        const piece = this.container.stores.get('${store.name}').load('${piece.directory}', ${JSON.stringify(path)});
                        if (piece && piece.init) piece.init();
                    }
                `);
            }
            return reply(message, `${this.container.constants.EMOTES.tick}  ::  Successfully loaded \`${piece.name}\` to ${store.name}. (Took ${timer.stop()})`);
        } catch (error) {
            timer.stop();
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Failed to load to ${store.name}: \`${piece ? piece.name : path.join('/')}\`. Reason: ${codeBlock('js', error)}`);
        }
    }

};
