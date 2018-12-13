const { Command, Duration } = require('klasa');
const { version, MessageEmbed } = require('discord.js');
const { uptime, loadavg } = require('os');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sts'],
			guarded: true,
			bucket: 2,
			cooldown: 15,
			requiredPermissions: ['EMBED_LINKS'],
			description: language => language.get('COMMAND_STATS_DESCRIPTION'),
			extendedHelp: language => language.get('COMMAND_STATS_EXTENDED')
		});
	}

	async run(msg) {
		const now = Date.now();
		msg.sendMessage(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`${this.client.user.tag}'s Statistics 📟`, this.client.user.displayAvatarURL())
			.setFooter(`Shard ${((msg.guild ? msg.guild.shard.id : msg.channel.shardID) || this.client.options.shardId) + 1} / ${this.client.options.shardCount}`)
			.setTimestamp()
			.addField('🤖 General Information', [
				`**Users**: ${this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
				`**Servers**: ${this.client.guilds.size.toLocaleString()}`,
				`**Text Channels**: ${this.client.channels.filter(chan => chan.type === 'text').size.toLocaleString()}`,
				`**Voice Connections**: ${this.client.voiceConnections.size}`,
				`**Discord.js**: v${version}`,
				`**Node JS**: ${process.version}`
			], true)
			.addField('⏱ Uptime', [
				`**Host**: ${Duration.toNow(now - (uptime() * 1000))}`,
				`**Client**: ${Duration.toNow(now - this.client.uptime)}`,
				`**Total**: ${Duration.toNow(now - (process.uptime() * 1000))}`
			], true)
			.addField('💾 Usage', [
				`**CPU Load**: ${Math.round(loadavg()[0] * 1000) / 100}%`,
				`**RAM Used**: ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`,
				`**RAM Total**: ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`
			], true));
	}

};
