const { Command } = require('@sapphire/framework');
const moment = require('moment-timezone');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['ui', 'userinfo', 'uinfo', 'who', 'whois'],
            runIn: ['text'],
            cooldown: 10,
            subcommands: true,
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gives information about you or another user (mention, tag, or ID).',
            usage: '[rawavatar|avatar|roles|id] [User:user]',
            usageDelim: ' '
        });
    }

    async run(msg, [player = msg.author]) {
        const timezone = msg.author.settings.get('timezone');
        const guildMember = await msg.guild.members.fetch(player.id, { cache: false }).catch(() => null);
        let nick = 'Not a member of this server',
            joined = 'Not a member of this server',
            roles = 'Not a member of this server',
            roleNum = '';

        if (guildMember) {
            nick = guildMember.nickname || 'None';
            joined = `${moment(guildMember.joinedAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(guildMember.joinedAt).fromNow()}`;
            roleNum = guildMember.roles.cache.size ? `[${guildMember.roles.cache.size}]` : '';

            if (!guildMember.roles.cache.size) {
                roles = 'None';
            } else {
                roles = guildMember.roles.cache.sort((a, b) => b.position - a.position);
                if (guildMember.roles.cache.size <= 10) roles = roles.array().join(' | ');
                else roles = `${roles.first(10).join(' | ')} **+ ${roles.size - 10} other role${roles.size - 10 === 1 ? '' : 's'}**`;
            }
        }

        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(player.tag, player.displayAvatarURL({ dynamic: true }))
            .setThumbnail(player.displayAvatarURL({ dynamic: true }))
            .addField('ID', player.id, true)
            .addField('Server Nickname', nick, true);
        if (!player.bot) embed.addField('User\'s Timezone', player.settings.get('timezone'), true);
        embed.addField('Joined Server', joined)
            .addField('Joined Discord', `${moment(player.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(player.createdAt).fromNow()}`)
            .addField(`Roles ${roleNum}`, roles)
            .setFooter(`Information requested by ${msg.author.tag}`, msg.author.displayAvatarURL({ dynamic: true }))
            .setTimestamp();
        return msg.sendEmbed(embed);
    }

    async roles(msg, [user = msg.author]) {
        const member = await msg.guild.members.fetch(user.id, { cache: false });
        if (member.roles.cache.size === 1) throw `**${user.username}** has no roles in this server!`;
        return msg.send({
            embed: new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`${user.username}'s Roles [${member.roles.cache.size}]`)
                .setDescription(member.roles.cache.sort((a, b) => b.position - a.position).array().join(' | '))
        });
    }

    async avatar(msg, [user = msg.author]) {
        return msg.send({
            embed: new MessageEmbed()
                .setTitle(`**${user.username}**'s avatar`)
                .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }))
        });
    }

    async rawavatar(msg, [user = msg.author]) {
        if (!msg.channel.permissionsFor(this.client.user).has('ATTACH_FILES')) throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! I have no permissions to attach files in this channel.`;
        return msg.send(`**${user.username}**'s avatar`, { files: [new MessageAttachment(user.displayAvatarURL({ dynamic: true }))] });
    }

    async id(msg, [user = msg.author]) {
        return msg.send(`**${user.username}**'s user ID is \`${user.id}\`.`);
    }

};
