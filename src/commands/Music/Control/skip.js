const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
            runIn: ['text'],
			description: 'Skips current song playing in the voice channel.',
			extendedHelp: 'If you want to force skip, just use the `--force` flag. Usable only by DJs and moderators.'
		});
	}

	async run(msg) {
		if (!msg.guild.voiceConnection || !msg.guild.voiceConnection.dispatcher || !msg.guild.voiceConnection.dispatcher.writable) throw '<:error:508595005481549846>  ::  There is no music playing in this server!'; // eslint-disable-line max-len
		if (msg.flags.force && await msg.hasAtLeastPermissionLevel(5)) {
			msg.guild.voiceConnection.dispatcher.end();
			return msg.send('<:check:508594899117932544>  ::  Successfully forcibly skipped the music for this server.');
		}
		if (msg.guild.voteskips.includes(msg.author.id)) throw '<:error:508595005481549846>  ::  You\'ve already voted to skip the current song.';
		msg.guild.addVoteskip(msg.author.id, msg.guild.voiceConnection.channel.members);
		const requiredVotes = msg.guild.voiceConnection.channel.members.filter(mb => !mb.user.bot && mb.id !== msg.guild.me.id).size / 2;
		if (msg.guild.voteskips.length <= requiredVotes) return msg.send(`<:check:508594899117932544>  ::  Successfully added your vote to skip the current song! Current votes: \`${msg.guild.voteskips.length}\`/\`${Math.ceil(requiredVotes) + 1}\`. Bots are not counted.`); // eslint-disable-line max-len
		msg.guild.clearVoteskips();
		msg.guild.voiceConnection.dispatcher.end();
		return msg.send('<:check:508594899117932544>  ::  Successfully skipped the music for this server.');
	}

};
