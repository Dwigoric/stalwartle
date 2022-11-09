const { Command } = require('@sapphire/framework');
const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { reply } = require('@sapphire/plugin-editable-commands');
const { promisify } = require('util');

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

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('piece')
                        .setDescription('The piece to unload.')
                        .setRequired(true))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: ['1015443818381848576']
        });
    }

    async chatInputRun(interaction) {
        const piece = await promisify(interaction.options.getString).bind(this)('piece').then(str => this.container.stores.get('arguments').get('piece').run(str)).catch(() => null);
        if (piece === null) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  Invalid piece.`, ephemeral: true });

        // add a confirmation prompt here

        piece.unload();
        if (this.container.client.shard) {
            await this.container.client.shard.broadcastEval(`
                if (String(this.options.shards) !== '${this.container.client.options.shards}') this.container.stores.get('${piece.store.name}').get('${piece.name}').unload();
            `);
        }
        return interaction.reply(`${this.container.constants.EMOTES.tick}  ::  Unloaded piece \`${piece.name}\` from ${piece.store.name}.`);
    }

    async messageRun(message, args) {
        const piece = await args.pick('piece').catch(() => null);
        if (piece === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Invalid piece.`);

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
