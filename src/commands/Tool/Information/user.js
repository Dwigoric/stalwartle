const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ui', 'userinfo', 'uinfo', 'who', 'whois'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            cooldownDelay: 10,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives information about you or another user (mention, tag, or ID).',
            subCommands: ['rawavatar', 'avatar', 'roles', 'id', { input: 'default', default: true }]
        });
        this.usage = '[rawavatar|avatar|roles|id] [User:user]';
    }

    async default(msg, args) {
        const player = await args.pick('user').catch(() => msg.author);

        const guildMember = await msg.guild.members.fetch(player.id, { cache: false }).catch(() => null);
        let nick = 'Not a member of this server',
            joined = 'Not a member of this server',
            roles = 'Not a member of this server',
            roleNum = '';

        if (guildMember) {
            nick = guildMember.nickname || 'None';
            joined = `<t:${parseInt(guildMember.joinedAt / 1000)}:f> (<t:${parseInt(guildMember.joinedAt / 1000)}:R>)`;
            roleNum = guildMember.roles.cache.size ? `[${guildMember.roles.cache.size}]` : '';

            if (!guildMember.roles.cache.size) {
                roles = 'None';
            } else {
                roles = guildMember.roles.cache.sort((a, b) => b.position - a.position);
                roles = guildMember.roles.cache.size <= 10 ? Array.from(roles.values()).join(' | ') : `${roles.first(10).join(' | ')} **+ ${roles.size - 10} other role${roles.size - 10 === 1 ? '' : 's'}**`;
            }
        }

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor({ name: player.tag, iconURL: player.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(player.displayAvatarURL({ dynamic: true }))
            .addField('ID', player.id, true)
            .addField('Server Nickname', nick, true);
        if (!player.bot) embed.addField('User\'s Timezone', this.container.stores.get('gateways').get('userGateway').get(player.id).timezone, true);
        embed.addField('Joined Server', joined)
            .addField('Joined Discord', `<t:${parseInt(player.createdAt / 1000)}:f> (<t:${parseInt(player.createdAt / 1000)}:R>)`)
            .addField(`Roles ${roleNum}`, roles)
            .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
        return reply(msg, { embeds: [embed] });
    }

    async roles(msg, args) {
        const user = await args.pick('user').catch(() => msg.author);

        const member = await msg.guild.members.fetch(user.id, { cache: false });
        if (member.roles.cache.size === 1) return reply(msg, `**${user.username}** has no roles in this server!`);
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${user.username}'s Roles [${member.roles.cache.size}]`)
                .setDescription(member.roles.cache.sort((a, b) => b.position - a.position).array().join(' | '))]
        });
    }

    async avatar(msg, args) {
        const user = await args.pick('user').catch(() => msg.author);

        return reply(msg, {
            embeds: [new MessageEmbed()
                .setTitle(`**${user.username}**'s avatar`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))]
        });
    }

    async rawavatar(msg, args) {
        const user = await args.pick('user').catch(() => msg.author);

        if (!msg.channel.permissionsFor(this.container.client.user).has('ATTACH_FILES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I have no permissions to attach files in this channel.`);
        return reply(msg, { content: `**${user.username}**'s avatar`, files: [new MessageAttachment(user.displayAvatarURL({ dynamic: true }))] });
    }

    async id(msg, args) {
        const user = await args.pick('user').catch(() => msg.author);

        return reply(msg, `**${user.username}**'s user ID is \`${user.id}\`.`);
    }

};
