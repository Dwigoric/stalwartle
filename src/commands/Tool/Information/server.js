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

	async run(msg, [dGuild = msg.guild]) {
		const { timezone } = msg.author.settings;
		const tchanCount = dGuild.channels.filter(ch => ch.type === 'text').size;
		const vchanCount = dGuild.channels.filter(ch => ch.type === 'voice').size;

		const verifLevel = [
			'None (Unrestricted)',
			'Low (Requires a verified email)',
			"Medium (5 mins must've\nelapsed since registry)",
			"High (10 mins must've\nelapsed since user join)",
			'Very High (Needs a verified\nphone number)'
		];

		const verif = verifLevel[dGuild.verificationLevel];

		const gregion = {
			'eu-central': 'Central Europe',
			'eu-west': 'Western Europe',
			hongkong: 'Hong Kong',
			'us-west': 'Western US',
			'us-east': 'Eastern US',
			'us-south': 'Southern US',
			'us-central': 'Central US'
		};

		const regionArr = dGuild.region.split('-');
		if (regionArr.includes('vip')) regionArr.splice(regionArr.indexOf('vip'), 1);
		const rawRegion = regionArr.join('-');
		let region = gregion[rawRegion] || rawRegion.replace(/^./, i => i.toUpperCase());
		if (dGuild.region.includes('vip')) region += ' [Partnered]';

		const roleCount = dGuild.roles.size > 1 ? dGuild.roles.size : 'None';

		let emojis;
		let emojiCount;
		if (dGuild.emojis.size === 0) {
			emojis = 'None';
			emojiCount = '';
		} else {
			emojiCount = `[${dGuild.emojis.size}]`;
			if (dGuild.emojis.size <= 10) emojis = dGuild.emojis.array().join(' ');
			else emojis = `${dGuild.emojis.first(10).join(' ')} **+ ${dGuild.emojis.size - 10} other emoji${dGuild.emojis.size - 10 === 1 ? '' : 's'}**`;
		}

		const avatarURL = msg.author.displayAvatarURL();
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor(dGuild.name, dGuild.iconURL({ format: 'png' }))
				.setThumbnail(dGuild.iconURL({ format: 'png' }))
				.addField('ID', dGuild.id, true)
				.addField('Owner', `${dGuild.owner.user.tag}\n(${dGuild.owner.user})`, true)
				.addField('Verification Level', verif, true)
				.addField('Server Region', region, true)
				.addField('Member Count (active/total)', `${dGuild.presences.size}/${dGuild.memberCount}`, true)
				.addField('Role Count', roleCount, true)
				.addField('Text Channel Count', tchanCount, true)
				.addField('Voice Channel Count', vchanCount, true)
				.addField('Created', `${moment(dGuild.createdAt).tz(timezone).format('dddd, LL | LTS')}\n>> ${moment(dGuild.createdAt).fromNow()}`)
				.addField(`Custom Emojis ${emojiCount}`, emojis)
				.setFooter(`Information requested by ${msg.author.tag}`, avatarURL)
				.setTimestamp()
		});
	}

	async icon(msg, [dGuild = msg.guild]) {
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setImage(dGuild.iconURL({ format: 'png', size: 2048 }))
		});
	}

	async roles(msg, [dGuild = msg.guild]) {
		if (dGuild.roles.size === 1) return msg.send("This server doesn't have any role yet!");
		return msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle(`${dGuild.name}'s Roles [${dGuild.roles.size}]`)
				.setDescription(dGuild.roles.sort((a, b) => b.position - a.position).array().join(' | '))
		});
	}

	async emojis(msg, [dGuild = msg.guild]) {
		if (!dGuild.emojis.size) return msg.send(`**${dGuild.name}** does not have any emoji yet.`);
		const stat = [],
			anim = [];

		dGuild.emojis.forEach(emoji => {
			if (/^<?a:/.test(emoji.toString())) anim.push(emoji);
			else stat.push(emoji);
		});

		const statCount = stat.length,
			animCount = anim.length;

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`${dGuild.name}'s Emojis [${dGuild.emojis.size}]`);
		const statEmojis = statCount ? stat.join('') : 'None';
		const animEmojis = animCount ? anim.join('') : 'None';

		if (statEmojis.length > 1024) {
			const stats = [];
			while (stat.length) stats.push(stat.splice(0, 25));
			stats.forEach((part, partNum) => embed.addField(`Static Emojis (Part ${partNum + 1} - ${part.length}/${statCount})`, part.join('')));
		} else {
			embed.addField(`Static Emojis ${statCount ? `[${statCount}]` : ''}`, statEmojis);
		}

		if (animEmojis.length > 1024) {
			const anims = [];
			while (anim.length) anims.push(anim.splice(0, 25));
			anims.forEach((part, partNum) => embed.addField(`Animated Emojis (Part ${partNum + 1} - ${part.length}/${animCount})`, part.join('')));
		} else {
			embed.addField(`Animated Emojis ${animCount ? `[${animCount}]` : ''}`, animEmojis);
		}

		return msg.send(embed);
	}

	async id(msg) {
		msg.send(`The server ID of ${msg.guild} is \`${msg.guild.id}\`.`);
	}

};
