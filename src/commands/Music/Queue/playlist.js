const { Command, RichDisplay, Timestamp, util: { chunk, mergeObjects } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');

const URL_REGEX = /^(https?:\/\/)?(www\.|[a-zA-Z-_]+\.)?(vimeo\.com|mixer\.com|bandcamp\.com|twitch\.tv|soundcloud\.com|youtube\.com|youtu\.?be)\/.+$/,
	YOUTUBE_PLAYLIST_REGEX = new RegExp('[&?]list=([a-z0-9-_]+)', 'i'),
	SOUNDCLOUD_SET_REGEX = new RegExp('/([a-z0-9-_]+)/sets/([a-z0-9-_]+)', 'i'),
	BANDCAMP_ALBUM_REGEX = new RegExp('/album/([a-z0-9-_]+)', 'i');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			description: 'Configures server playlist, which plays when queue is empty. More at `s.help playlist`',
			extendedHelp: [
				'***Prompts are not supported when adding tracks to the playlist.***',
				'To add tracks **using the add subcommand**, supply the playlist/album/set link, or the usual way to add videos to the queue with `s.play` command.',
				'To remove tracks from the playlist, do the same as you would with `s.remove` but with using the `remove` subcommand.',
				'To clear the playlist, simply use the `clear` subcommand. e.g. `s.playlist clear`',
				'To export the playlist, run `s.playlist export`',
				'To move stuff in the playlist, run `s.playlist move` and I will guide you through the rest of the process.',
				'To shuffle the playlist, run `s.playlist shuffle`.'
			],
			usage: '[add|remove|clear|export|move|shuffle] (TracksURLOrPlaylistItems:string)',
			usageDelim: ' ',
			subcommands: true
		});
		this
			.createCustomResolver('string', (arg, possible, msg, [action]) => {
				if (!['add', 'remove'].includes(action)) return undefined;
				if (!arg) {
					if (action === 'add') throw '<:error:508595005481549846>  ::  Please provide the URL of the song(s) you want to add to the playlist.';
					else throw '<:error:508595005481549846>  ::  Please provide the range of items to remove from the playlist.';
				}
				if (action === 'add') return this.client.arguments.get('url').run(arg, possible, msg);
				else return arg;
			});
	}

	async run(msg) {
		const { playlist } = await this.client.providers.default.get('music', msg.guild.id);
		if (!playlist.length) throw `<:error:508595005481549846>  ::  There are no songs in the playlist yet! Add one with \`${msg.guild.settings.get('prefix')}playlist add\``;
		const message = await msg.channel.send('<a:loading:430269209415516160>  ::  Loading the music playlist...');
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Server Music Playlist: ${msg.guild.name}`, msg.guild.iconURL())
			.setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.setTimestamp());

		let duration = 0;
		chunk(playlist, 10).forEach((music10, tenPower) => display.addPage(template => template.setDescription(music10.map((music, onePower) => {
			const { length } = music.info;
			duration += music.info.isStream ? 0 : length;
			return `\`${(tenPower * 10) + (onePower + 1)}\`. **${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)} \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\``; // eslint-disable-line max-len
		}))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${playlist.length} Playlist Item${playlist.length === 1 ? '' : 's'}] - Playlist Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`) // eslint-disable-line max-len
			.run(message, { filter: (reaction, author) => author === msg.author });
	}

	async add(msg, [tracks]) {
		if (msg.guild.settings.get('donation') < 3) throw '<:error:508595005481549846>  ::  Sorry! This feature is limited to servers which have donated $3 or more.';
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs can configure the playlist!';
		if (!URL_REGEX.test(tracks) && !['.m3u', '.pls', 'xspf'].includes(tracks.slice(-4))) throw '<:error:508595005481549846>  ::  Unsupported URL.';
		const songs = await this.store.get('play').getSongs(tracks, tracks.includes('soundcloud.com'));
		if (!songs.length) throw '<:error:508595005481549846>  ::  You provided an invalid stream or URL.';
		return this.addToPlaylist(msg, YOUTUBE_PLAYLIST_REGEX.test(tracks) || SOUNDCLOUD_SET_REGEX.test(tracks) || BANDCAMP_ALBUM_REGEX.test(tracks) ?
			songs :
			songs[0]);
	}

	async remove(msg, [items]) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs can configure the playlist!';
		items = items.split('-').slice(0, 2);
		items = [parseInt(items[0]), parseInt(items[1])];
		if (isNaN(items[0])) throw `<:error:508595005481549846>  ::  Invalid playlist entry given. Refer to \`${msg.guild.settings.get('prefix')}help remove\` for more information.`;
		if (!items[1]) items = items[0] - 1; // eslint-disable-line prefer-destructuring
		else items = [items[0] - 1, items[1] - 1];
		if (items === -1 || items[0] === -1) throw '<:error:508595005481549846>  ::  All lists start at 1...';
		const { queue, playlist, history } = await this.client.providers.default.get('music', msg.guild.id);
		if (!playlist.length) throw `<:error:508595005481549846>  ::  There are no items in the playlist. Add one using \`${msg.guild.settings.get('prefix')}play\``;
		if (Array.isArray(items)) {
			if (items[0] > items[1]) throw '<:error:508595005481549846>  ::  Invalid playlist range. The first number must be less than the second.';
			if (items[0] > playlist.length - 1 || items[1] > playlist.length - 1) throw `<:error:508595005481549846>  ::  There are only ${playlist.length - 1} items in the playlist.`;
			playlist.splice(items[0], items[1] - items[0] + 1);
			msg.send(`<:check:508594899117932544>  ::  Successfully removed items \`#${items[0] + 1}\` to \`#${items[1] + 1}\` from the playlist.`);
		} else {
			if (items > playlist.length - 1) throw `<:error:508595005481549846>  ::  There are only ${playlist.length - 1} items in the playlist.`;
			playlist.splice(items, 1);
			msg.send(`<:check:508594899117932544>  ::  Successfully removed song \`#${items + 1}\` from the playlist.`);
		}
		return this.client.providers.default.update('music', msg.guild.id, { queue, playlist, history });
	}

	async clear(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs can configure the playlist!';
		const { queue, history } = await this.client.providers.default.get('music', msg.guild.id);
		this.client.providers.default.update('music', msg.guild.id, { playlist: [], queue, history });
		msg.send('<:check:508594899117932544>  ::  Successfully cleared the music playlist for this server.');
	}

	async export(msg) {
		const { playlist } = await this.client.providers.default.get('music', msg.guild.id);
		if (!playlist.length) throw `<:error:508595005481549846>  ::  The playlist is empty. Add one using the \`${msg.guild.settings.get('prefix')}playlist add\` command.`;
		let choice;
		do {
			choice = await msg.prompt('📜  ::  Should the playlist be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.').catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'none', null].includes(choice.content));
		switch (choice.content) {
			case 'file': {
				if (!msg.channel.attachable) throw '<:error:508595005481549846>  ::  I do not have the permissions to attach files to this channel.';
				return msg.channel.sendFile(Buffer.from(playlist.map(track => track.info.uri).join('\r\n')), 'output.txt', '<:check:508594899117932544>  ::  Exported the playlist as file.'); // eslint-disable-line max-len
			}
			case 'haste':
			case 'hastebin': {
				const { key } = await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: playlist.map(track => track.info.uri).join('\r\n')
				}).then(res => res.json()).catch(() => { throw '<:error:508595005481549846>  ::  Sorry! An unknown error occurred.'; });
				return msg.send(`<:check:508594899117932544>  ::  Exported the playlist to hastebin: <https://hastebin.com/${key}.stalwartle>`);
			}
		}
		return null;
	}

	async move(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs can configure the playlist!';
		const { queue, playlist, history } = await this.client.providers.default.get('music', msg.guild.id);
		if (playlist.length < 2) throw '<:error:508595005481549846>  ::  There is no playlist item to move.';
		let entry;
		do entry = await msg.prompt('<a:loading:430269209415516160>  ::  Which playlist item do you want to move? Reply with its playlist number.');
		while (!parseInt(entry));
		entry = parseInt(entry) - 1;
		let position;
		do position = await msg.prompt(`<a:loading:430269209415516160>  ::  To which position do you want \`#${entry + 1}\` to be moved to? Reply with the position number.`);
		while (!parseInt(position));
		position = parseInt(position) - 1;
		if (entry > playlist.length - 1 || position > playlist.length - 1) throw `<:error:508595005481549846>  ::  The playlist only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`;
		if (entry === position) throw '<:error:508595005481549846>  ::  What\'s the point of moving a playlist to the same position?';
		playlist.splice(position, 0, playlist.splice(entry, 1)[0]);
		await this.client.providers.default.update('music', msg.guild.id, { queue, playlist, history });
		return msg.send(`<:check:508594899117932544>  ::  Successfully moved item \`#${entry + 1}\` to position \`#${position + 1}\`.`);
	}

	async shuffle(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw '<:error:508595005481549846>  ::  Only DJs can configure the playlist!';
		const { queue, playlist, history } = await this.client.providers.default.get('music', msg.guild.id);
		if (!playlist.length) throw `<:error:508595005481549846>  ::  There are no songs in the playlist. Add one with \`${msg.guild.settings.get('prefix')}playlist add\``;
		if (playlist.length === 1) throw '<:error:508595005481549846>  ::  There is only one playlist item... I have nothing to shuffle!';
		this.client.providers.default.update('music', msg.guild.id, {
			queue,
			history,
			playlist: (() => {
				for (let current = playlist.length - 1; current > 0; current--) {
					const random = Math.floor(Math.random() * (current + 1));
					const temp = playlist[current];
					playlist[current] = playlist[random];
					playlist[random] = temp;
				}
				return playlist;
			})()
		});
		msg.send(`<:check:508594899117932544>  ::  Successfully shuffled the playlist. Check it out with \`${msg.guild.settings.get('prefix')}playlist\``);
	}

	async addToPlaylist(msg, items) {
		const { queue, playlist, history } = await this.client.providers.default.get('music', msg.guild.id);
		if (Array.isArray(items)) {
			let songCount = 0;
			for (const track of items) {
				if (msg.guild.settings.get('donation') < 5 && track.info.length > 18000000) continue;
				playlist.push(mergeObjects(track, { requester: msg.author.id, incognito: false }));
				songCount++;
			}
			msg.channel.send(`🎶  ::  **${songCount} song${songCount === 1 ? '' : 's'}** ha${songCount === 1 ? 's' : 've'} been added to the playlist.${msg.guild.settings.get('donation') < 5 && songCount < items.length ? ' All songs longer than 5 hours weren\'t added.' : ''}`); // eslint-disable-line max-len
		} else {
			if (playlist.length >= msg.guild.settings.get('music.maxPlaylist')) throw `<:error:508595005481549846>  ::  The music playlist for **${msg.guild.name}** has reached the limit of ${msg.guild.settings.get('music.maxPlaylist')} songs; currently ${playlist.length}.`; // eslint-disable-line max-len
			playlist.push(mergeObjects(items, { requester: msg.author.id, incognito: false }));
			msg.channel.send(`🎶  ::  **${items.info.title}** has been added to the playlist.`);
		}
		await this.client.providers.default.update('music', msg.guild.id, { queue, playlist, history });
		return playlist;
	}

};
