const { Command } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 5,
			description: 'Removes a single entry or multiple entries from the server music queue.',
			extendedHelp: [
				'To remove a single song from the queue, use `s.remove <songID>`',
				'To remove multiple songs from the queue, use `s.remove <startSongID>-<endSongID>`',
				'e.g. to remove songs #3 to #5, use `s.remove 3-5`'
			],
			usage: '<QueueItems:string>'
		});
	}

	async run(msg, [songs]) {
		songs = songs.split('-').slice(0, 2);
		songs = [parseInt(songs[0]), parseInt(songs[1])];
		if (isNaN(songs[0])) throw `${this.client.constants.EMOTES.xmark}  ::  Invalid queue entry given. Refer to \`${msg.guild.settings.get('prefix')}help remove\` for more information.`;
		if (!songs[1]) songs = songs[0]; // eslint-disable-line prefer-destructuring
		if (songs === 0 || songs[0] === 0) throw `${this.client.constants.EMOTES.xmark}  ::  The current song playing cannot be removed from the queue.`;
		const { queue } = msg.guild.music;
		if (!queue.length) throw `${this.client.constants.EMOTES.xmark}  ::  There are no songs in the queue. Add one using \`${msg.guild.settings.get('prefix')}play\``;
		if (Array.isArray(songs)) {
			if (songs[0] > songs[1]) throw `${this.client.constants.EMOTES.xmark}  ::  Invalid queue range. The first number must be less than the second.`;
			if (songs[0] > queue.length - 1 || songs[1] > queue.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  There are only ${queue.length - 1} songs in the queue.`;
			queue.splice(songs[0], songs[1] - songs[0] + 1);
			msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully removed songs \`#${songs[0]}\` to \`#${songs[1]}\` from the queue.`);
		} else {
			if (songs > queue.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  There are only ${queue.length - 1} songs in the queue.`;
			const [song] = queue.splice(songs, 1);
			msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully removed **${escapeMarkdown(song.info.title)}** from the queue.`);
		}
		return msg.guild.music.update('queue', queue, { action: 'overwrite' });
	}

};
