const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Puts a certain message (given the message ID or link) in an embed, as if "quoting" the message.',
            detailedDescription: 'The message ID is only applicable if you are quoting from the same channel; otherwise, the link is required. Note that the bot has to have the "Embed Links" permission to see the message.'
        });
        this.usage = '<MessageID:string> [Channel:channel]';
    }

    async messageRun(msg, args) {
        const message = await args.pick('message').catch(() => null);
        if (message === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the message ID (will work only here in ${msg.channel}) or link to the message.`);

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription([
                message.content,
                `[**⇶ Jump to Message**](https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
            ].join('\n\n'))
            .setFooter({ text: `Quoted by ${msg.author.tag} | #${message.channel.name}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp(new Date(message.createdTimestamp));
        const media = message.attachments.size ? message.attachments.filter(atch => {
            const filename = atch.name;
            return /.(png|gif|jpe?g|webp)/i.test(filename.slice(-1 * (filename.length - filename.lastIndexOf('.'))));
        }) : null;
        if (media && media.size) embed.setImage(media.first().url);
        return reply(msg, { embeds: [embed] });
    }

};
