const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed } = require('discord.js');
module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['si', 'sinfo', 'serverinfo'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives information about the current server.',
            subCommands: ['icon', 'roles', 'id', { input: 'default', default: true }]
        });
        this.usage = '[icon|roles|id]';
    }

    // skipcq: JS-0105
    async default(msg) {
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor({ name: msg.guild.name, iconURL: msg.guild.iconURL({ dynamic: true, format: 'png' }) })
                .setThumbnail(msg.guild.iconURL({ dynamic: true, format: 'png' }))
                .addField('ID', msg.guild.id, true)
                .addField('Owner', await msg.guild.members.fetch(msg.guild.ownerId).then(owner => `${owner.user.tag}\n(${owner})`), true)
                .addField('Verification Level', {
                    NONE: 'None (Unrestricted)',
                    LOW: 'Low (Requires a verified email)',
                    MEDIUM: 'Medium (5 mins must\'ve elapsed since registry)',
                    HIGH: 'High (10 mins must\'ve elapsed since user join)',
                    VERY_HIGH: 'Very High (Needs a verified phone number)'
                }[msg.guild.verificationLevel], true)
                .addField('Two-Factor Requirement', msg.guild.mfaLevel === 'ELEVATED' ? 'Enabled' : 'Disabled', true)
                .addField('Explicit Content Filter', {
                    DISABLED: 'Don\'t scan any messages.',
                    MEMBERS_WITHOUT_ROLES: 'Scan messages from members without a role.',
                    ALL_MEMBERS: 'Scan messages sent by all members.'
                }[msg.guild.explicitContentFilter], true)
                .addField('Member Count', String(msg.guild.memberCount), true)
                .addField('Role Count', msg.guild.roles.cache.size > 1 ? String(msg.guild.roles.cache.size) : 'None', true)
                .addField('Text Channel Count', String(msg.guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').size), true)
                .addField('Voice Channel Count', String(msg.guild.channels.cache.filter(ch => ch.type === 'GUILD_VOICE').size), true)
                .addField('Created', `<t:${(msg.guild.createdAt / 1000).toFixed()}:f> (<t:${(msg.guild.createdAt / 1000).toFixed()}:R>)`)
                .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()]
        });
    }

    // skipcq: JS-0105
    async icon(msg) {
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setImage(msg.guild.iconURL({ dynamic: true, format: 'png', size: 2048 }))]
        });
    }

    // skipcq: JS-0105
    async roles(msg) {
        if (msg.guild.roles.cache.size === 1) return reply(msg, 'This server doesn\'t have any role yet!');
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${msg.guild.name}'s Roles [${msg.guild.roles.cache.size}]`)
                .setDescription(Array.from(msg.guild.roles.cache.sort((a, b) => b.position - a.position).values()).join(' | '))]
        });
    }

    // skipcq: JS-0105
    async id(msg) {
        reply(msg, `The server ID of ${msg.guild} is \`${msg.guild.id}\`.`);
    }

};
