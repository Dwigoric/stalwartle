const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Skips current song playing in the voice channel.',
			extendedHelp: [
				'If you want to force skip, just use the `--force` flag. Usable only by DJs and moderators.',
				'To skip to a specific entry in the queue, just do `s.skip <entry number>`. Also usable only by DJs and moderators.'
			],
			usage: '[QueueEntry:integer]'
		});
	}

	async run(msg, [entry]) {
		if (!msg.guild.me.voice.channelID) throw `${this.client.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
		if (entry && await msg.hasAtLeastPermissionLevel(5)) return this.skipToEntry(msg, entry);
		if (msg.flagArgs.force && await msg.hasAtLeastPermissionLevel(5)) {
			msg.guild.clearVoteskips();
			msg.guild.player.stop();
			return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully forcibly skipped the music for this server.`);
		}
		if (msg.guild.voteskips.includes(msg.author.id)) throw `${this.client.constants.EMOTES.xmark}  ::  You've already voted to skip the current song.`;
		const { members } = msg.guild.me.voice.channel;
		if (!members.has(msg.author.id)) throw `${this.client.constants.EMOTES.xmark}  ::  You are not connected to the voice channel I'm playing on.`;
		msg.guild.addVoteskip(msg.author.id, members);
		const requiredVotes = members.filter(mb => !mb.user.bot).size / 2;
		if (msg.guild.voteskips.length <= requiredVotes) return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully added your vote to skip the current song! Current votes: \`${msg.guild.voteskips.length}\`/\`${Math.floor(requiredVotes + 1)}\`. Bots are not counted. To forcibly skip the song, use \`${msg.guild.settings.get('prefix')}skip --force\`.`); // eslint-disable-line max-len
		msg.guild.clearVoteskips();
		msg.guild.player.stop();
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully skipped the music for this server.`);
	}

	async skipToEntry(msg, entry) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (queue.length < 2) throw `${this.client.constants.EMOTES.xmark}  ::  There is no queue entry to skip to.`;
		if (entry > queue.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`;
		queue.splice(1, 0, queue.splice(entry, 1)[0]);
		await this.client.providers.default.update('music', msg.guild.id, { queue });
		msg.guild.clearVoteskips();
		msg.guild.player.stop();
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully skipped to entry \`#${entry}\`.`);
	}

};
