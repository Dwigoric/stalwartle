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
		if (!msg.guild.player.channel || !msg.guild.player.playing) throw '<:error:508595005481549846>  ::  There is no music playing in this server!';
		const chan = msg.guild.channels.get(msg.guild.player.channel);
		if (!chan.members.has(msg.member.id)) throw `<:error:508595005481549846>  ::  You must be connected to #**${chan.name}** to be able to skip songs.`;
		if (msg.flags.force && await msg.hasAtLeastPermissionLevel(5)) {
			msg.guild.clearVoteSkips();
			msg.guild.player.stop();
			return msg.send('<:check:508594899117932544>  ::  Successfully forcibly skipped the music for this server.');
		}
		if (msg.guild.voteskips.includes(msg.author.id)) throw '<:error:508595005481549846>  ::  You\'ve already voted to skip the current song.';
		msg.guild.addVoteskip(msg.author.id, chan.members);
		const requiredVotes = chan.members.filter(mb => !mb.user.bot).size / 2;
		if (msg.guild.voteskips.length <= requiredVotes) return msg.send(`<:check:508594899117932544>  ::  Successfully added your vote to skip the current song! Current votes: \`${msg.guild.voteskips.length}\`/\`${Math.ceil(requiredVotes) + 1}\`. Bots are not counted.`); // eslint-disable-line max-len
		msg.guild.clearVoteskips();
		msg.guild.player.stop();
		return msg.send('<:check:508594899117932544>  ::  Successfully skipped the music for this server.');
	}

};
