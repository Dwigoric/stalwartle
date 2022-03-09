const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Puts a certain message (given the message ID or link) in an embed, as if "quoting" the message.'
        });
    }

    async messageRun(msg, args) {
        let message = await args.pickResult('message');
        if (!message.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the message link or ID.`);
        message = message.value;

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
