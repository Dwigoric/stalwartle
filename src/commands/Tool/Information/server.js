const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['si', 'sinfo', 'serverinfo'],
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives information about a server.',
			usage: '[icon|roles|emojis|id] (Server:guild)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('guild', (arg, possible, msg, [action]) => {
			if (['id'].includes(action) || !arg) return undefined;
			return this.client.arguments.get('guild').run(arg, possible, msg);
		});
	}

	async run(msg, [guild = msg.guild]) {
		const timezone = msg.author.settings.get('timezone');
		const tchanCount = guild.channels.filter(ch => ch.type === 'text').size;
		const vchanCount = guild.channels.filter(ch => ch.type === 'voice').size;

		const verifLevel = [
			'None (Unrestricted)',
			'Low (Requires a verified email)',
			"Medium (5 mins must've\nelapsed since registry)",
			"High (10 mins must've\nelapsed since user join)",
			'Very High (Needs a verified\nphone number)'
		];

		const gregion = {
			'eu-central': 'Central Europe',
			'eu-west': 'Western Europe',
			hongkong: 'Hong Kong',
			'us-west': 'Western US',
			'us-east': 'Eastern US',
			'us-south': 'Southern US',
			'us-central': 'Central US'
		};

		const filter = [
			'Don\'t scan any messages.',
			'Scan messages from\nmembers without a role',
			'Scan messages sent by\nall members.'
		];

		const regionArr = guild.region.split('-');
		if (regionArr.includes('vip')) regionArr.splice(regionArr.indexOf('vip'), 1);
		const rawRegion = regionArr.join('-');
		let region = gregion[rawRegion] || rawRegion.replace(/^./, i => i.toUpperCase());
		if (guild.region.includes('vip')) region += ' [Partnered]';

		const roleCount = guild.roles.size > 1 ? guild.roles.size : 'None';

		let emojis = 'None';
		let emojiCount = '';
		if (guild.emojis.size !== 0) {
			emojiCount = `[${guild.emojis.size}]`;
			if (guild.emojis.size <= 10) emojis = guild.emojis.array().join(' ');
			else emojis = `${guild.emojis.first(10).join(' ')} **+ ${guild.emojis.size - 10} other emoji${guild.emojis.size - 10 === 1 ? '' : 's'}**`;
		}

		const avatarURL = msg.author.displayAvatarURL();
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor(guild.name, guild.iconURL({ format: 'png' }))
				.setThumbnail(guild.iconURL({ format: 'png' }))
				.addField('ID', guild.id, true)
				.addField('Owner', await guild.members.fetch(guild.ownerID).then(owner => `${owner.user.tag}\n(${owner})`), true)
				.addField('Server Region', region, true)
				.addField('Verification Level', verifLevel[guild.verificationLevel], true)
				.addField('Two-Factor Requirement', guild.mfaLevel ? 'Enabled' : 'Disabled', true)
				.addField('Explicit Content Filter', filter[guild.explicitContentFilter], true)
				.addField('Member Count (active/total)', `${guild.presences.size}/${guild.memberCount}`, true)
				.addField('Role Count', roleCount, true)
				.addField('Text Channel Count', tchanCount, true)
				.addField('Voice Channel Count', vchanCount, true)
				.addField('Created', `${moment(guild.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(guild.createdAt).fromNow()}`)
				.addField(`Custom Emojis ${emojiCount}`, emojis)
				.setFooter(`Information requested by ${msg.author.tag}`, avatarURL)
				.setTimestamp()
		});
	}

	async icon(msg, [guild = msg.guild]) {
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setImage(guild.iconURL({ format: 'png', size: 2048 }))
		});
	}

	async roles(msg, [guild = msg.guild]) {
		if (guild.roles.size === 1) return msg.send("This server doesn't have any role yet!");
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`${guild.name}'s Roles [${guild.roles.size}]`)
				.setDescription(guild.roles.sort((a, b) => b.position - a.position).array().join(' | '))
		});
	}

	async emojis(msg, [guild = msg.guild]) {
		if (!guild.emojis.size) return msg.send(`**${guild.name}** does not have any emoji yet.`);
		const stat = guild.emojis.filter(emoji => !emoji.animated).array(),
			anim = guild.emojis.filter(emoji => emoji.animated).array();

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`${guild.name}'s Emojis [${guild.emojis.size}]`);
		const statEmojis = stat.length ? stat.join('') : 'None';
		const animEmojis = anim.length ? anim.join('') : 'None';

		if (statEmojis.length > 1024) {
			const stats = [];
			while (stat.length) stats.push(stat.splice(0, 25));
			stats.forEach((part, partNum) => embed.addField(`Static Emojis (Part ${partNum + 1} - ${part.length}/${stat.length})`, part.join('')));
		} else {
			embed.addField(`Static Emojis ${stat.length ? `[${stat.length}]` : ''}`, statEmojis);
		}

		if (animEmojis.length > 1024) {
			const anims = [];
			while (anim.length) anims.push(anim.splice(0, 25));
			anims.forEach((part, partNum) => embed.addField(`Animated Emojis (Part ${partNum + 1} - ${part.length}/${anim.length})`, part.join('')));
		} else {
			embed.addField(`Animated Emojis ${anim.length ? `[${anim.length}]` : ''}`, animEmojis);
		}

		return msg.send(embed);
	}

	async id(msg) {
		msg.send(`The server ID of ${msg.guild} is \`${msg.guild.id}\`.`);
	}

};
