const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['si', 'sinfo', 'serverinfo'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gives information about a server.',
            usage: '[icon|roles|id] (Server:guild)',
            usageDelim: ' ',
            subcommands: true
        });

        this.createCustomResolver('guild', (arg, possible, msg, [action]) => {
            if (['id'].includes(action) || !arg) return undefined;
            return this.container.client.arguments.get('guild').run(arg, possible, msg);
        });
    }

    async messageRun(msg, [guild = msg.guild]) {
        const timezone = msg.author.settings.get('timezone');

        const rawRegion = guild.region.split('-').slice(guild.region.includes('vip') ? 1 : 0).join('-');
        let region = {
            'eu-central': 'Central Europe',
            'eu-west': 'Western Europe',
            hongkong: 'Hong Kong',
            southafrica: 'South Africa',
            'us-west': 'Western US',
            'us-east': 'Eastern US',
            'us-south': 'Southern US',
            'us-central': 'Central US'
        }[rawRegion] || rawRegion.replace(/^./, i => i.toUpperCase());
        if (guild.region.includes('vip')) region += ' [Partnered]';

        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor({ name: guild.name, iconURL: guild.iconURL({ dynamic: true, format: 'png' }) })
                .setThumbnail(guild.iconURL({ dynamic: true, format: 'png' }))
                .addField('ID', guild.id, true)
                .addField('Owner', await guild.members.fetch(guild.ownerID).then(owner => `${owner.user.tag}\n(${owner})`), true)
                .addField('Server Region', region, true)
                .addField('Verification Level', {
                    NONE: 'None (Unrestricted)',
                    LOW: 'Low (Requires a verified email)',
                    MEDIUM: 'Medium (5 mins must\'ve elapsed since registry)',
                    HIGH: 'High (10 mins must\'ve elapsed since user join)',
                    VERY_HIGH: 'Very High (Needs a verified phone number)'
                }[guild.verificationLevel], true)
                .addField('Two-Factor Requirement', guild.mfaLevel ? 'Enabled' : 'Disabled', true)
                .addField('Explicit Content Filter', {
                    DISABLED: 'Don\'t scan any messages.',
                    MEMBERS_WITHOUT_ROLES: 'Scan messages from members without a role.',
                    ALL_MEMBERS: 'Scan messages sent by all members.'
                }[guild.explicitContentFilter], true)
                .addField('Member Count', guild.memberCount, true)
                .addField('Role Count', guild.roles.cache.size > 1 ? guild.roles.cache.size : 'None', true)
                .addField('Text Channel Count', guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').size, true)
                .addField('Voice Channel Count', guild.channels.cache.filter(ch => ch.type === 'GUILD_VOICE').size, true)
                .addField('Created', `${moment(guild.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(guild.createdAt).fromNow()}`)
                .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()]
        });
    }

    async icon(msg, [guild = msg.guild]) {
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setImage(guild.iconURL({ dynamic: true, format: 'png', size: 2048 }))]
        });
    }

    async roles(msg, [guild = msg.guild]) {
        if (guild.roles.cache.size === 1) throw 'This server doesn\'t have any role yet!';
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${guild.name}'s Roles [${guild.roles.cache.size}]`)
                .setDescription(guild.roles.cache.sort((a, b) => b.position - a.position).array().join(' | '))]
        });
    }

    async id(msg) {
        reply(msg, `The server ID of ${msg.guild} is \`${msg.guild.id}\`.`);
    }

};
