const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { promisify } = require('util');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['OwnersOnly'],
            description: 'Re-disables or temporarily disables a piece. Default state restored on reboot.'
        });
        this.usage = '<Piece:piece>';
        this.guarded = true;
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('piece')
                        .setDescription('The name of the piece to disable.')
                        .setRequired(true))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: ['1015443730473426984']
        });
    }

    async chatInputRun(interaction) {
        const piece = await promisify(interaction.options.getString).bind(this)('piece').then(str => this.container.stores.get('arguments').get('piece').run(str)).catch(() => null);
        if (piece === null) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  Invalid piece name.`, ephemeral: true });

        piece.enabled = false;
        if (this.container.client.shard) {
            await this.container.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').enabled = false;
            `);
        }
        return interaction.reply({ content: `${this.container.constants.EMOTES.tick}  ::  Successfully disabled \`${piece.name}\` from ${piece.store.name}.`, ephemeral: true });
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
