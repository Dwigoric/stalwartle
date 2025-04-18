const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { toTitleCase } = require('@sapphire/utilities');
const { MessageEmbed } = require('discord.js');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ci', 'cinfo', 'channelinfo'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: "Gives information about the channel you're on or the channel you provided.",
            subCommands: ['id', { input: 'default', default: true }]
        });
        this.usage = '[id] [Channel:channel]';
    }

    // skipcq: JS-0105
    async default(msg, args) {
        const chan = await args.pick('channel').catch(() => msg.channel);

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: `Channel information for #${chan.name}` })
            .addField('ID', chan.id, true)
            .addField('Type', toTitleCase(chan.type), true)
            .addField('Category', chan.parent ? chan.parent.name : 'No Category', true)
            .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
        if (chan.type === 'GUILD_TEXT') {
            embed
                .setDescription(chan.topic || 'No topic set.')
                .addField('Position', String(chan.position), true)
                .addField('NSFW', chan.nsfw ? 'Enabled' : 'Disabled', true)
                .addField('Ratelimit', chan.rateLimitPerUser ? `1 msg/${chan.rateLimitPerUser} second${chan.rateLimitPerUser === 1 ? '' : 's'}` : 'Disabled', true);
        } else if (chan.type === 'GUILD_VOICE') {
            embed
                .addField('Bitrate', `${chan.bitrate / 1000}kbps`, true)
                .addField('User Limit', String(chan.userLimit), true);
        }
        return reply(msg, { embeds: [embed.addField('Created', `<t:${(chan.createdAt / 1000).toFixed()}:f> (<t:${(chan.createdAt / 1000).toFixed()}:R>)`)] });
    }

    // skipcq: JS-0105
    async id(msg, args) {
        const chan = await args.pick('channel').catch(() => msg.channel);
        reply(msg, `The channel ID of **#${chan.name}** is \`${chan.id}\`.`);
    }

};
