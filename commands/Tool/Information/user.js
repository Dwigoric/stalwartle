const { Command } = require('klasa');
const moment = require('moment-timezone');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ui', 'userinfo', 'uinfo', 'who', 'whois'],
			runIn: ['text'],
			subcommands: true,
			description: 'Gives information about you or another user (mention, tag, or ID).',
			usage: '[rawavatar|avatar|roles|id] [User:user]',
			usageDelim: ' '
		});
	}

	async run(msg, [player = msg.author]) {
		const { timezone } = msg.author.configs;
		const guildMember = await msg.guild.members.fetch(player.id).catch(() => null);
		let nick;
		let joined;
		let roles;
		let roleNum;

		if (!guildMember) {
			nick = 'Not a member of this server';
			joined = 'Not a member of this server';
			roles = 'Not a member of this server';
			roleNum = '';
		} else {
			const { nickname } = guildMember;
			if (nickname === null) nick = 'None';
			else nick = nickname;

			joined = `${moment(guildMember.joinedAt).tz(timezone).format('dddd, LL | LTS')}\n>> ${moment(guildMember.joinedAt).fromNow()}`;
			if (!guildMember.roles.size) {
				roles = 'None';
				roleNum = '';
			} else {
				if (guildMember.roles.size <= 10) roles = guildMember.roles.sort((a, b) => b.position - a.position).first(10).map(rl => rl).join(' | ');
				else roles = guildMember.roles.sort((a, b) => b.position - a.position).map(rl => rl).join(' | ');
				roleNum = `[${guildMember.roles.size}]`;
			}
		}

		const guildCount = this.client.guilds.filter(gd => gd.members.has(player.id)).size;

		const presences = this.client.users.get(player.id).presence;
		const gameplay = presences.activity;
		let presenceStatus;
		if (!guildCount) {
			presenceStatus = "I wouldn't know since we\nhave no mutual servers 😢";
		} else if (gameplay && gameplay.type === 'STREAMING') {
			presenceStatus = 'Streaming';
		} else {
			switch (presences.status) {
				case 'dnd':
					presenceStatus = 'Do Not Disturb';
					break;
				default:
					presenceStatus = presences.status.replace(/^./, i => i.toUpperCase());
					break;
			}
		}

		const statusEmoji = {
			Online: '<:online:415894324652277762>',
			Idle: '<:idle:415894324610596865>',
			'Do Not Disturb': '<:dnd:415894324522254338>',
			Streaming: '<:streaming:415894325075902474>',
			Offline: '<:offline:415894324966981632>',
			Invisible: '<:offline:415894324966981632>'
		};

		let accType;
		if (player.bot) accType = 'Bot';
		else accType = 'User';

		const avatarURL = player.displayAvatarURL();

		const userEmbed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(player.tag, avatarURL)
			.setThumbnail(avatarURL)
			.addField('ID', player.id, true)
			.addField('Server Nickname', nick, true)
			.addField('Status', `${guildCount ? statusEmoji[presenceStatus] : ''} ${presenceStatus}`, true)
			.addField('Mutual Server Count', guildCount, true)
			.addField('Account Type', accType, true)
			.addField('Timezone Used', timezone, true)
			.addField('Joined Server', joined)
			.addField('Joined Discord', `${moment(player.createdAt).tz(timezone).format('dddd, LL | LTS')}\n>> ${moment(player.createdAt).fromNow()}`)
			.addField(`Roles ${roleNum}`, roles)
			.setFooter(`Information requested by ${msg.author.tag}`, msg.author.displayAvatarURL())
			.setTimestamp();

		if (gameplay) {
			return msg.send({
				embed: userEmbed.setDescription(`${gameplay && gameplay.type === 'LISTENING' ?
					'Listening to' :
					gameplay.type.replace(/\B[a-zA-Z0-9]+/, str => str.toLowerCase())} **${gameplay.name}**`)
			});
		}
		return msg.send({ embed: userEmbed });
	}

	async roles(msg, [user = msg.author]) {
		const member = await msg.guild.members.fetch(user.id);
		if (member.roles.size === 1) return msg.send(`**${user.username}** has no roles in this server!`);

		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`${user.username}'s Roles [${member.roles.size}]`)
				.setDescription(member.roles.sort((a, b) => b.position - a.position).map(rl => rl).join(' | '))
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
		if (!msg.channel.permissionsFor(this.client.user).has('ATTACH_FILES')) return msg.send(`<:redTick:399433440975519754>  ::  Sorry! I have no permissions to attach files in this channel.`);
		return msg.send(`**${user.username}**'s avatar`, { files: [new MessageAttachment(user.displayAvatarURL())] });
	}

	async id(msg, [user = msg.author]) {
		return msg.send(`**${user.username}**'s user ID is \`${user.id}\`.`);
	}

};
