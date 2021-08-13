const { Listener, Events, util: { codeBlock } } = require('@sapphire/framework');
const { WebhookClient, MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.CommandError });
        this.hook = null;
    }

    async run(msg, command, params, error) {
        const errorID = (this.client.shard ? this.client.shard.id.toString(36) : '') + Date.now().toString(36);
        if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
        if (error.message) {
            msg
                .send(`⚠ Whoa! You found a bug! Please catch this bug and send it with the **error ID \`${errorID}\`** using the \`bug\` command!${codeBlock('xl', error.message)}`)
                .catch(err => this.client.emit('wtf', err));
        } else {
            return msg.sendMessage(error).catch(err => this.client.emit('wtf', err));
        }
        if (error.stack && this.client.application.botPublic) {
            return this.hook.send(`${this.client.application.owner}, an error occured with **${this.client.user.tag}**!`, new MessageEmbed()
                .setColor(0xE74C3C)
                .setTitle(`Details of Error ID \`${errorID}\``)
                .setDescription([
                    `**Shard ID**: ${this.client.shard ? this.client.shard.id : 'N/A'}`,
                    `**Trigerrer**: ${msg.author} (${msg.author.id})`,
                    `**Guild**: ${msg.guild ? `${escapeMarkdown(msg.guild.name)} (${msg.guild.id})` : '[Direct Messages]'}`,
                    `**Channel**: ${msg.guild ? `#${escapeMarkdown(msg.channel.name)}` : '[Direct Messages]'} (${msg.channel.id})`,
                    `**Command**: \`${escapeMarkdown(msg.content)}\``,
                    codeBlock('js', error.message),
                    codeBlock('xl', error.stack)
                ])
                .setTimestamp()
            );
        }
        return error.stack;
    }

    async init() {
        const { id, token } = this.client.settings.get('errorHook');
        this.hook = new WebhookClient(id, token);
    }

};
