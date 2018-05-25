const { Command, Duration } = require('klasa');
const { version } = require('discord.js');
const { uptime, loadavg } = require('os');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sts'],
			bucket: 2,
			cooldown: 15,
			description: (msg) => msg.language.get('COMMAND_STATS_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_STATS_EXTENDED')
		});
	}

	async run(msg) {
		const now = Date.now();
		const stats = [
			'= STATISTICS =',
			`• Users     ::  ${this.client.guilds.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`,
			`• Guilds    ::  ${this.client.guilds.size.toLocaleString()}`,
			`• Channels  ::  ${this.client.channels.size.toLocaleString()}`,
			`• Version   ::  v${version}`,
			`• Node JS   ::  ${process.version}`,
			'\n= UPTIME =',
			`• Host      ::  ${Duration.toNow(now - (uptime() * 1000))}`,
			`• Total     ::  ${Duration.toNow(now - (process.uptime() * 1000))}`,
			`• Client    ::  ${Duration.toNow(now - this.client.uptime)}`,
			'\n= USAGE =',
			`• CPU Load  ::  ${Math.round(loadavg()[0] * 10000) / 100}%`,
			`• RAM Total ::  ${Math.round(100 * (process.memoryUsage().heapTotal / 1048576)) / 100}MB`,
			`• RAM Used  ::  ${Math.round(100 * (process.memoryUsage().heapUsed / 1048576)) / 100}MB`
		];
		if (this.client.options.shardCount) stats.splice(6, 0, `• Shard     ::  ${((msg.guild ? msg.guild.shardID : msg.channel.shardID) || this.client.options.shardId) + 1} / ${this.client.options.shardCount}`); // eslint-disable-line max-len
		msg.sendMessage(stats.join('\n'), { code: 'asciidoc' });
	}

};
