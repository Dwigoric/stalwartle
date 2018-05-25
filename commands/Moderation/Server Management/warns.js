const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 6,
			aliases: ['warnings'],
			description: 'Gives the warnings for a certain person or the server.',
			extendedHelp: 'If you want to get the warnings for the whole server, simply do not provide a user.',
			usage: '[User:user]'
		});
	}

	async run(msg, [user]) {
		const { timezone } = msg.author.configs;
		const first5 = [];
		let list = await this.client.providers.default.get('modlogs', msg.guild.id).then(pv => pv.modlogs);
		if (user) list = list.filter(ml => ml.user === user.id && ml.type === 'warn');
		list = list.filter(ml => ml.type === 'warn').sort((a, b) => Number(a.id) - Number(b.id));
		if (!list.length) throw `<:blobStop:399433444108533780>  ::  Whoops! It seems that ${user ? user.tag : msg.guild.name} has no warnings${user ? ' on this server' : ''} yet.`;
		while (list.length) first5.push(list.splice(0, 5));

		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`<:blobthinkstare:398843280135028738> Warnings for ${user ? `${user.bot ? 'bot' : 'user'} ${user.tag}` : msg.guild.name}`)
		);

		first5.forEach(modlog5 => {
			display.addPage(template => {
				const description = modlog5.map(modlog => {
					const _user = this.client.users.get(modlog.user);
					const moderator = this.client.users.get(modlog.moderator);
					return [
						`__**Case #${modlog.id}**__`,
						`Moderator: ${moderator || 'Could not get user'} (\`${modlog.moderator}\`)`,
						`User: ${_user || 'Could not get user'} (\`${modlog.user}\`)`,
						`Date: ${moment(modlog.timestamp).tz(timezone).format('dddd, LL | LTS')} (${moment(modlog.timestamp).fromNow()})`,
						`Reason: ${modlog.reason || 'Not specified.'}`
					].join('\n');
				});
				return template.setDescription(description.join('\n\n'));
			});
		});

		return display
			.setFooterPrefix('Page ')
			.run(await msg.channel.send('<a:loading:430269209415516160>  ::  Loading warnings...'), { filter: (reaction, author) => author === msg.author });
	}

};
