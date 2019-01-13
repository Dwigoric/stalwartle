const { Command } = require('klasa');
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
			roleNum = guildMember.roles.size ? `[${guildMember.roles.size}]` : '';

			if (!guildMember.roles.size) {
				roles = 'None';
			} else {
				roles = guildMember.roles.sort((a, b) => b.position - a.position);
				if (guildMember.roles.size <= 10) roles = roles.array().join(' | ');
				else roles = `${roles.first(10).join(' | ')} **+ ${roles.size - 10} other role${roles.size - 10 === 1 ? '' : 's'}**`;
			}
		}

		const { activity, status } = await this.client.users.fetch(player.id).then(us => us.presence);
		const presenceStatus = activity && activity.type === 'STREAMING' ? 'Streaming' :
			status === 'dnd' ? 'Do Not Disturb' : status.replace(/^./, i => i.toUpperCase());

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(player.tag, player.displayAvatarURL())
			.setThumbnail(player.displayAvatarURL())
			.addField('ID', player.id, true)
			.addField('Server Nickname', nick, true)
			.addField('Status', `${{
				Online: '<:online:415894324652277762>',
				Idle: '<:idle:415894324610596865>',
				'Do Not Disturb': '<:dnd:415894324522254338>',
				Streaming: '<:streaming:415894325075902474>',
				Offline: '<:offline:415894324966981632>',
				Invisible: '<:invisible:415894324899872768>'
			}[presenceStatus]} ${presenceStatus}`, true);
		if (!player.bot) embed.addField('User\'s Timezone', player.settings.get('timezone'), true);
		embed.addField('Joined Server', joined)
			.addField('Joined Discord', `${moment(player.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(player.createdAt).fromNow()}`)
			.addField(`Roles ${roleNum}`, roles)
			.setFooter(`Information requested by ${msg.author.tag}`, msg.author.displayAvatarURL())
			.setTimestamp();

		let description = player.bot ? '<:bot:415894324589363211> ' : '';
		if (activity) {
			description += `${activity && activity.type === 'LISTENING' ?
				'Listening to' :
				activity.type.replace(/\B[a-zA-Z0-9]+/, str => str.toLowerCase())} **${activity.name}**${activity.details ? ' <:richpresence:504544678364971008>' : ''}`;
		}
		return msg.sendEmbed(embed.setDescription(description));
	}

	async roles(msg, [user = msg.author]) {
		const member = await msg.guild.members.fetch(user.id, { cache: false });
		if (member.roles.size === 1) throw `**${user.username}** has no roles in this server!`;
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`${user.username}'s Roles [${member.roles.size}]`)
				.setDescription(member.roles.sort((a, b) => b.position - a.position).array().join(' | '))
		});
	}

	async avatar(msg, [user = msg.author]) {
		return msg.send({
			embed: new MessageEmbed()
				.setTitle(`**${user.username}**'s avatar`)
				.setImage(user.displayAvatarURL({ size: 2048 }))
		});
	}

	async rawavatar(msg, [user = msg.author]) {
		if (!msg.channel.permissionsFor(this.client.user).has('ATTACH_FILES')) throw '<:error:508595005481549846>  ::  Sorry! I have no permissions to attach files in this channel.';
		return msg.send(`**${user.username}**'s avatar`, { files: [new MessageAttachment(user.displayAvatarURL())] });
	}

	async id(msg, [user = msg.author]) {
		return msg.send(`**${user.username}**'s user ID is \`${user.id}\`.`);
	}

};
