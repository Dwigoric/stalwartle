const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { promisify } = require('util');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['OwnersOnly'],
            description: 'Re-enables or temporarily enables a piece. Default state restored on reboot.'
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
                        .setDescription('The name of the piece to enable.')
                        .setRequired(true))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: ['1015443731895304283']
        });
    }

    async chatInputRun(interaction) {
        const piece = await promisify(interaction.options.getString).bind(this)('piece').then(str => this.container.stores.get('arguments').get('piece').run(str)).catch(() => null);
        if (piece === null) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  Invalid piece name.`, ephemeral: true });

        piece.enabled = true;
        if (this.container.client.shard) {
            interaction.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').enabled = true;
            `);
        }
        return interaction.reply({ content: `${this.container.constants.EMOTES.tick}  ::  Successfully enabled \`${piece.name}\` to ${piece.store.name}.`, ephemeral: true });
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
