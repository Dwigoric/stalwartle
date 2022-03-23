const { Listener, Events } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { codeBlock } = require('@sapphire/utilities');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.CommandError });
        this.hook = null;
    }

    async run(error, context) {
        const errorID = (this.container.client.shard ? this.container.client.shard.id.toString(36) : '') + Date.now().toString(36);
        if (error instanceof Error) this.container.logger.error(`[COMMAND] ${context.command.path}\n${error.stack || error}`);
        if (error.message) {
            reply(context.message, `⚠ Whoa! You found a bug! Please catch this bug and send it with the **error ID \`${errorID}\`** using the \`bug\` command!${codeBlock('xl', error.message)}`)
                .catch(err => this.container.logger.error(err));
        }
        if (error.stack && this.container.client.application.botPublic) {
            return this.hook.send({
                content: `${this.container.client.application.owner}, an error occured with **${this.container.client.user.tag}**!`,
                embeds: [new MessageEmbed()
                    .setColor(0xE74C3C)
                    .setTitle(`Details of Error ID \`${errorID}\``)
                    .setDescription([
                        `**Shard ID**: ${this.container.client.shard ? this.container.client.shard.id : 'N/A'}`,
                        `**Trigerrer**: ${context.message.author} (${context.message.author.id})`,
                        `**Guild**: ${context.message.guild ? `${escapeMarkdown(context.message.guild.name)} (${context.message.guild.id})` : '[Direct Messages]'}`,
                        `**Channel**: ${context.message.guild ? `#${escapeMarkdown(context.message.channel.name)}` : '[Direct Messages]'} (${context.message.channel.id})`,
                        `**Command**: \`${escapeMarkdown(context.message.content)}\``,
                        codeBlock('js', error.message),
                        codeBlock('xl', error.stack)
                    ].join('\n'))
                    .setTimestamp()]
            });
        }
        return error.stack;
    }

    async init() {
        const { id, token } = this.container.client.settings.errorHook;
        this.hook = new WebhookClient({ id, token });
    }

};
