const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const { reply } = require('@sapphire/plugin-editable-commands');
const { promisify } = require('util');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 5000,
            description: 'Replies to a bug report or a suggestion.',
            detailedDescription: 'To deny, just add the flag `--deny`. It will not send to the resulting channel.',
            flags: ['deny'],
            preconditions: ['DevsOnly'],
            requiredClientPermissions: ['EMBED_LINKS'],
            runIn: [CommandOptionsRunTypeEnum.GuildText]
        });
        this.usage = '<User:user> <Message:message> <Comment:...string>';
    }

    reportChannels = {
        [this.container.client.settings.bugs.reports]: this.container.client.settings.bugs.processed,
        [this.container.client.settings.suggestions.reports]: this.container.client.settings.suggestions.processed
    };

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user included in the report.')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('The message ID or message link of the report.')
                        .setRequired(true))
                .addStringOption(option =>
                    option
                        .setName('comment')
                        .setDescription('Comments on the report.')
                        .setRequired(true))
                .addAttachmentOption(option =>
                    option
                        .setName('attachment')
                        .setDescription('Attachment to the report.'))
                .addBooleanOption(option =>
                    option
                        .setName('deny')
                        .setDescription('Denies the report.'))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: []
        });
    }

    async chatInputRun(interaction) {
        const user = interaction.options.getUser('user');
        const message = await promisify(interaction.options.getString).bind(this)('message').then(str => this.container.stores.get('arguments').get('message').run(str)).catch(() => null);
        if (message === null) return interaction.reply(`${this.container.constants.EMOTES.xmark}  ::  Invalid message ID or link.`);
        const comment = interaction.options.getString('comment');

        if (!message.author.equals(this.container.client.user)) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  I am not the author of the message you provided.`, ephemeral: true });
        if (!Object.keys(this.reportChannels).includes(message.channel.id)) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  This command can only be run in bug and suggestions channels.`, ephemeral: true });
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .addFields([
                { name: 'Message', value: message.url, inline: true },
                { name: 'Comment', value: comment, inline: true }
            ])
            .setTimestamp();

        const attachment = interaction.options.getAttachment('attachment');
        if (attachment && /.(png|gif|jpe?g|webp)/i.test(attachment.name.slice(-1 * (attachment.name.length - attachment.name.lastIndexOf('.'))))) embed.setImage(attachment.url);

        if (!interaction.options.getBoolean('deny')) this.container.client.channels.cache.get(this.reportChannels[message.channel.id]).send({ embeds: [embed] }).catch(() => null);
        interaction.reply({ content: `${this.container.constants.EMOTES.check}  ::  Report sent to **${user.tag}**.`, ephemeral: true });
        message.delete().catch(() => null);
        return user.send({ content: 'Your submission has been acknowledged!', embeds: [embed] }).catch(() => null);
    }

    async messageRun(msg, args) {
        const repUser = await args.pick('user').catch(() => null);
        if (repUser === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You must supply the user/reporter of the report.`);

        const repMsg = await args.pick('message').catch(() => null);
        if (repMsg === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You must supply the message ID or message link of the report.`);

        const repCom = await args.rest('string').then(str => str.trim()).catch(() => null);
        if (repCom === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You must supply comments on the report.`);

        if (!repMsg.author.equals(this.container.client.user)) return msg.delete();
        if (!Object.keys(this.reportChannels).includes(msg.channel.id)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This command can only be run in bug and suggestions channels.`);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: repUser.tag, iconURL: repUser.displayAvatarURL({ dynamic: true }) })
            .addFields([
                { name: 'Submission', value: repMsg.content },
                { name: 'Comments', value: repCom }
            ])
            .setTimestamp();
        const attachments = repMsg.attachments.size ? repMsg.attachments.filter(atch => {
            const filename = atch.name;
            return /.(png|gif|jpe?g|webp)/i.test(filename.slice(-1 * (filename.length - filename.lastIndexOf('.'))));
        }) : null;
        if (attachments && attachments.size) embed.setImage(attachments.first().url);
        if (!args.getFlags('deny')) this.container.client.channels.cache.get(this.reportChannels[msg.channel.id]).send({ embeds: [embed] }).catch(() => null);
        msg.delete();
        await msg.channel.send(`${this.container.constants.EMOTES.tick}  ::  Report sent to **${repUser.tag}**.`).then(sent => setTimeout(() => sent.delete(), 5000));
        repMsg.delete().catch(() => null);
        return repUser.send({ content: 'Your submission has been acknowledged!', embeds: [embed] }).catch(() => null);
    }

};
