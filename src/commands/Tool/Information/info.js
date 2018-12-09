const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bot', 'bi', 'details', 'what'],
			guarded: true,
			requiredPermissions: ['EMBED_LINKS'],
			description: language => language.get('COMMAND_INFO_DESCRIPTION')
		});
	}

	async run(msg) {
		const timezone = msg.author.settings.get('timezone');
		const now = moment(new Date());
		const uptime = moment(new Date() - this.client.uptime);
		const sinceUp = moment.duration(now.diff(uptime));
		const upDays = sinceUp.days();
		const upHours = sinceUp.hours();
		const upMins = sinceUp.minutes();
		const upSecs = sinceUp.seconds();

		// const owners = await Promise.all(require('../../../config').config.owners.map(owner => this.client.users.fetch(owner).then(own => own.tag)));

		const avatarURL = this.client.user.displayAvatarURL();
		msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setAuthor(`Information about ${this.client.user.username}`, avatarURL)
				.setThumbnail(avatarURL)
				//  .addField("Shard ID", this.client.shard.id, true)
				// .addField("Users", await this.client.shard.broadcastEval('this.guilds.reduce((a, b) => a + b.memberCount)').then(results => results.reduce((prev, val) => prev + val, 0).toLocaleString())
			// .then(results => results.reduce((prev, val) => prev + val, 0).toLocaleString()), true)
				.addField('Users', this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString(), true)
				.addField('Servers', (await this.client.guildCount()).toLocaleString(), true)
				//  .addField("Channels", await this.client.shard.broadcastEval('this.channels.size').then(results => results.reduce((prev, val) => prev + val, 0)).toLocaleString(), true)
				.addField('Channels', this.client.channels.size.toLocaleString(), true)
				.addField('Uptime', `${upDays}d ${upHours}h ${upMins}m ${upSecs}s`, true)
				.addField('Discord.js Version', require('discord.js').version, true)
				.addField('Node.js Version', process.version, true)
				.addField('Memory Used', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`, true)
				.addField('Bot Creator', this.client.application.owner.tag, true)
				.addField('Created', `${moment(this.client.user.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(this.client.user.createdAt).fromNow()}`)
				.setFooter(`Information requested by ${msg.author.tag}`, msg.author.displayAvatarURL())
				.setTimestamp()
		});
	}

};
