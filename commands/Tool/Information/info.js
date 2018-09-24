const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bot', 'bi', 'details', 'what'],
			guarded: true,
			description: language => language.get('COMMAND_INFO_DESCRIPTION')
		});
	}

	async run(msg) {
		const { timezone } = msg.author.settings;

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
				.addField('<:vfd:448013603593781257> Official VFD Product', `This is an official product\nof ${this.client.guilds.get('173146091640848384').name}\n(https://discord.gg/ZzjZ8ba)`, true)
			//  .addField('Support', `${this.client.guilds.get('369311992176967680').name}\n(https://discord.gg/gTtVN6h)`, true)
			//  .addField("Users", await this.client.shard.broadcastEval('this.users.size').then(results => results.reduce((prev, val) => prev + val, 0)), true)
				.addField('Users', this.client.users.size, true)
				.addField('Servers', await this.client.guildCount(), true)
			//  .addField("Channels", await this.client.shard.broadcastEval('this.channels.size').then(results => results.reduce((prev, val) => prev + val, 0)), true)
				.addField('Channels', this.client.channels.size, true)
				.addField('Uptime', `${upDays}d ${upHours}h ${upMins}m ${upSecs}s`, true)
				.addField('Memory Used', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)}MB`, true)
				.addField('Bot Version', require('../../../package.json').version, true)
				.addField('Discord.js Version', require('discord.js').version, true)
				.addField('Node.js Version', process.version, true)
				.addField('Bot Creator', this.client.application.owner.tag, true)
				.addField('Created', `${moment(this.client.user.createdAt).tz(timezone).format('dddd, LL | LTS')}\n>> ${moment(this.client.user.createdAt).fromNow()}`)
				.setFooter(`Information requested by ${msg.author.tag}`, msg.author.displayAvatarURL())
				.setTimestamp()
		});
	}

};
