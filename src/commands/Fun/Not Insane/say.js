const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: 'EMBED_LINKS',
            description: 'Makes the bot say anything you want.',
            usage: '[delete|embed|anonymous] [Channel:channel] <Content:string{1,1000}> [...]',
            usageDelim: ' ',
            subCommands: ['delete', 'embed', 'anonymous', { input: 'default', default: true }]
        });
    }

    async default(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (!chan.permissionsFor(this.client.user).has('SEND_MESSAGES')) throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`;
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Message sent!`);
        return chan.send(msgargs);
    }

    async delete(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (!msg.guild || !msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot delete messages in this channel.`;
        if (!chan.permissionsFor(this.client.user).has('SEND_MESSAGES')) throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`;
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Message sent!`);
        chan.send(msgargs);
        return msg.delete().catch(() => null);
    }

    async embed(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let msgargs = await args.restResult('string');
        if (!msgargs) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (!chan.permissionsFor(this.client.user).has('SEND_MESSAGES')) throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`;
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
        if (!msgargs) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the message you want to say.`);
        msgargs = msgargs.value;

        if (!msg.guild || !msg.channel.permissionsFor(this.container.client.user).has('MANAGE_MESSAGES')) throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot delete messages in this channel.`;
        if (!chan.permissionsFor(this.client.user).has('SEND_MESSAGES')) throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`;
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
