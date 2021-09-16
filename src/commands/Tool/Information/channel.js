const { Command, util: { toTitleCase } } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['ci', 'cinfo', 'channelinfo'],
            runIn: ['text'],
            requiredPermissions: ['EMBED_LINKS'],
            description: "Gives information about the channel you're on or the channel you provided.",
            usage: '[id] [Channel:channel]',
            usageDelim: ' ',
            subcommands: true
        });
    }

    async run(msg, [chan = msg.channel]) {
        const timezone = msg.author.settings.get('timezone');

        let embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(`Channel information for #${chan.name}`)
            .addField('ID', chan.id, true)
            .addField('Type', toTitleCase(chan.type), true)
            .addField('Category', chan.parent ? chan.parent.name : 'No Category', true)
            .setFooter(`Information requested by ${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
        if (chan.type === 'GUILD_TEXT') {
            embed = embed
                .setDescription(chan.topic || 'No topic set.')
                .addField('Position', chan.position, true)
                .addField('NSFW', chan.nsfw ? 'Enabled' : 'Disabled', true)
                .addField('Ratelimit', chan.rateLimitPerUser ? `1 msg/${chan.rateLimitPerUser} second${chan.rateLimitPerUser === 1 ? '' : 's'}` : 'Disabled', true);
        } else if (chan.type === 'GUILD_VOICE') {
            embed = embed
                .addField('Bitrate', `${chan.bitrate / 1000}kbps`, true)
                .addField('User Limit', chan.userLimit, true);
        }
        embed = embed.addField('Created', `${moment(chan.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(chan.createdAt).fromNow()}`);
        return msg.send({ embed });
    }

    async id(msg, [chan = msg.channel]) {
        msg.send(`The channel ID of **#${chan.name}** is \`${chan.id}\`.`);
    }

};
