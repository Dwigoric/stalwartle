const { Subcommand } = require('@sapphire/plugin-subcommands');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Subcommand {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: 'EMBED_LINKS',
            description: 'Makes the bot say anything you want.',
            subCommands: ['delete', 'embed', 'anonymous', { input: 'default', default: true }]
        });
        this.usage = '[Channel:channel] <Content:string{1,2000}> [...]';
    }

    async default(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (msgargs.length > 2000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please input a message of 2000 characters or less.`);
        if (msg.guild && !chan.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`);
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Message sent!`);
        return chan.send(msgargs);
    }

    async delete(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (msgargs.length > 2000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please input a message of 2000 characters or less.`);
        if (!msg.guild || !msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot delete messages in this channel.`);
        if (!chan.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`);
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Message sent!`);
        chan.send(msgargs);
        return msg.delete().catch(() => null);
    }

    async embed(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (msgargs.length > 2000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please input a message of 2000 characters or less.`);
        if (msg.guild && !chan.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`);
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Message sent!`);
        return chan.send({
            embeds: [await new MessageEmbed()
                .setColor(0x40E0D0)
                .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(msgargs)
                .setFooter({ text: `From #${msg.channel.name}` })
                .setTimestamp()]
        });
    }

    async anonymous(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (msgargs.length > 2000) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please input a message of 2000 characters or less.`);
        if (!msg.guild || !msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot delete messages in this channel.`);
        if (!chan.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`);
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Message sent!`);
        chan.send({
            embeds: [await new MessageEmbed()
                .setColor(0x40E0D0)
                .setAuthor({ name: 'Anonymous User' })
                .setDescription(msgargs)
                .setFooter({ text: `From #${msg.channel.name}` })
                .setTimestamp()]
        });
        return msg.delete().catch(() => null);
    }

};
