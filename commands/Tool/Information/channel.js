const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ci', 'cinfo', 'channelinfo'],
			runIn: ['text'],
			description: "Gives information about the channel you're on or the channel you provided.",
			usage: '[id] [Channel:channel]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg, [chan = msg.channel]) {
		const avatarURL = msg.author.displayAvatarURL();
		const { timezone } = msg.author.settings;

		let embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Channel information for #${chan.name}`)
			.addField('ID', chan.id, true)
			.addField('Type', chan.type.toTitleCase(), true)
			.setFooter(`Information requested by ${msg.author.tag}`, avatarURL)
			.setTimestamp();
		if (chan.type === 'text') {
			let nsfwstatus;
			if (chan.nsfw) nsfwstatus = 'Enabled';
			else nsfwstatus = 'Disabled';
			embed = embed.addField('NSFW', nsfwstatus, true);
		} else if (chan.type === 'voice') {
			embed = embed
				.addField('Bitrate', `${chan.bitrate / 1000}kbps`, true)
				.addField('User Limit', chan.userLimit, true);
		}
		embed = embed.addField('Created', `${moment(chan.createdAt).tz(timezone).format('dddd, LL | LTS')}\n>> ${moment(chan.createdAt).fromNow()}`);
		return msg.send({ embed: embed });
	}

	async id(msg, [chan = msg.channel]) {
		msg.send(`The channel ID of **#${chan.name}** is \`${chan.id}\`.`);
	}

};
