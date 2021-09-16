const { Command, RichDisplay, Timestamp, util: { chunk, mergeObjects } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');

const URL_REGEX = /^(https?:\/\/)?(www\.|[a-zA-Z-_]+\.)?(vimeo\.com|mixer\.com|bandcamp\.com|twitch\.tv|soundcloud\.com|youtube\.com|youtu\.?be)\/.+$/;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
			description: 'Configures server playlist, which plays when queue is empty. More at `s.help playlist`',
			extendedHelp: [
				'***Prompts are not supported when adding tracks to the playlist.***',
				'To add tracks **using the add subcommand**, supply the playlist/album/set link, or the usual way to add videos to the queue with `s.play` command.',
				'To add the current queue to the playlist, run `s.playlist add queue`.',
				'To completely replace the playlist with the current queue, run `s.playlist add queuereplace`.',
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
					if (action === 'add') throw `${this.client.constants.EMOTES.xmark}  ::  Please provide the URL of the song(s) you want to add to the playlist.`;
					else throw `${this.client.constants.EMOTES.xmark}  ::  Please provide the range of items to remove from the playlist.`;
				}
				if (action === 'add') return this.client.arguments.get('url').run(arg, possible, msg);
				else return arg;
			});
	}

	async run(msg) {
		const { playlist = [] } = await this.client.providers.default.get('music', msg.guild.id) || {};
		if (!playlist.length) throw `${this.client.constants.EMOTES.xmark}  ::  There are no songs in the playlist yet! Add one with \`${msg.guild.settings.get('prefix')}playlist add\``;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the music playlist...`);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`Server Music Playlist: ${msg.guild.name}`, msg.guild.iconURL({ dynamic: true }))
			.setTitle('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.setTimestamp());

		let duration = 0;
		chunk(playlist, 10).forEach((music10, tenPower) => display.addPage(template => template.setDescription(music10.map((music, onePower) => {
			const { length } = music.info;
			duration += music.info.isStream ? 0 : length;
			return `\`${(tenPower * 10) + (onePower + 1)}\`. [**${escapeMarkdown(music.info.title)}** by ${escapeMarkdown(music.info.author)}](${music.info.uri}) \`${music.info.isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\``; // eslint-disable-line max-len
		}))));

		return display
			.setFooterPrefix('Page ')
			.setFooterSuffix(` [${playlist.length} Playlist Item${playlist.length === 1 ? '' : 's'}] - Playlist Duration: ${new Timestamp(`${duration >= 86400000 ? 'DD[d]' : ''}${duration >= 3600000 ? 'HH[h]' : ''}mm[m]ss[s]`).display(duration)}`) // eslint-disable-line max-len
			.run(await message.edit(`${this.client.constants.EMOTES.tick}  ::  Server music playlist has been loaded!`), { filter: (reaction, author) => author === msg.author });
	}

	async add(msg, [songs]) {
		if (msg.guild.settings.get('donation') < 3) throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! This feature is limited to servers which have donated $3 or more.`;
		if (!await msg.hasAtLeastPermissionLevel(5)) throw `${this.client.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`;
		if (!URL_REGEX.test(songs) && !['.m3u', '.pls'].includes(songs.slice(-4))) throw `${this.client.constants.EMOTES.xmark}  ::  Unsupported URL.`;

		if (['queue', 'queuereplace'].includes(songs)) {
			switch (songs) {
				case 'queue':
					this.addToPlaylist(msg, (await this.client.providers.default.get('music', msg.guild.id) || {}).queue || []);
					break;
				case 'queuereplace':
					this.client.providers.default.update('music', msg.guild.id, { playlist: (await this.client.providers.default.get('music', msg.guild.id) || {}).queue || [] }, true);
					break;
			}
			return null;
		}

		const { loadType, tracks } = await this.store.get('play').getSongs(songs, songs.includes('soundcloud.com'));
		if (loadType === 'LOAD_FAILED') throw `${this.client.constants.EMOTES.xmark}  ::  Something went wrong when loading your tracks. Sorry 'bout that! Please try again.`;
		if (loadType === 'NO_MATCHES') throw `${this.client.constants.EMOTES.xmark}  ::  You provided an invalid stream or URL.`;
		return this.addToPlaylist(msg, loadType === 'PLAYLIST_LOADED' ?
			tracks :
			tracks[0]);
	}

	async remove(msg, [items]) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw `${this.client.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`;
		items = items.split('-').slice(0, 2);
		items = [parseInt(items[0]), parseInt(items[1])];
		if (isNaN(items[0])) throw `${this.client.constants.EMOTES.xmark}  ::  Invalid playlist entry given. Refer to \`${msg.guild.settings.get('prefix')}help remove\` for more information.`;
		if (!items[1]) items = items[0] - 1; // eslint-disable-line prefer-destructuring
		else items = [items[0] - 1, items[1] - 1];
		if (items === -1 || items[0] === -1) throw `${this.client.constants.EMOTES.xmark}  ::  All lists start at 1...`;
		const { playlist = [] } = await this.client.providers.default.get('music', msg.guild.id) || {};
		if (!playlist.length) throw `${this.client.constants.EMOTES.xmark}  ::  There are no items in the playlist. Add one using \`${msg.guild.settings.get('prefix')}play\``;
		if (Array.isArray(items)) {
			if (items[0] > items[1]) throw `${this.client.constants.EMOTES.xmark}  ::  Invalid playlist range. The first number must be less than the second.`;
			if (items[0] > playlist.length - 1 || items[1] > playlist.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  There are only ${playlist.length - 1} items in the playlist.`;
			playlist.splice(items[0], items[1] - items[0] + 1);
			msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully removed items \`#${items[0] + 1}\` to \`#${items[1] + 1}\` from the playlist.`);
		} else {
			if (items > playlist.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  There are only ${playlist.length - 1} items in the playlist.`;
			playlist.splice(items, 1);
			msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully removed song \`#${items + 1}\` from the playlist.`);
		}
		return this.client.providers.default.update('music', msg.guild.id, { playlist });
	}

	async clear(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw `${this.client.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`;
		this.client.providers.default.update('music', msg.guild.id, { playlist: [] });
		msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully cleared the music playlist for this server.`);
	}

	async export(msg) {
		const { playlist = [] } = await this.client.providers.default.get('music', msg.guild.id) || {};
		if (!playlist.length) throw `${this.client.constants.EMOTES.xmark}  ::  The playlist is empty. Add one using the \`${msg.guild.settings.get('prefix')}playlist add\` command.`;
		let choice;
		do {
			choice = await msg.prompt('📜  ::  Should the playlist be exported to `haste`/`hastebin` or `file`? Please reply with your respective answer.').catch(() => ({ content: 'none' }));
		} while (!['file', 'haste', 'hastebin', 'none', null].includes(choice.content));
		switch (choice.content) {
			case 'file': {
				if (!msg.channel.attachable) throw `${this.client.constants.EMOTES.xmark}  ::  I do not have the permissions to attach files to this channel.`;
				return msg.channel.sendFile(Buffer.from(playlist.map(track => track.info.uri).join('\r\n')), 'output.txt', `${this.client.constants.EMOTES.tick}  ::  Exported the playlist as file.`); // eslint-disable-line max-len
			}
			case 'haste':
			case 'hastebin': {
				const { key } = await fetch('https://hastebin.com/documents', {
					method: 'POST',
					body: playlist.map(track => track.info.uri).join('\r\n')
				}).then(res => res.json()).catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  Sorry! An unknown error occurred.`; });
				return msg.send(`${this.client.constants.EMOTES.tick}  ::  Exported the playlist to hastebin: <https://hastebin.com/${key}.stalwartle>`);
			}
		}
		return null;
	}

	async move(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw `${this.client.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`;
		const { playlist = [] } = await this.client.providers.default.get('music', msg.guild.id) || {};
		if (playlist.length < 2) throw `${this.client.constants.EMOTES.xmark}  ::  There is no playlist item to move.`;
		let entry;
		do entry = await msg.prompt(`${this.client.constants.EMOTES.loading}  ::  Which playlist item do you want to move? Reply with its playlist number.`);
		while (!parseInt(entry));
		entry = parseInt(entry) - 1;
		let position;
		do position = await msg.prompt(`${this.client.constants.EMOTES.loading}  ::  To which position do you want \`#${entry + 1}\` to be moved to? Reply with the position number.`);
		while (!parseInt(position));
		position = parseInt(position) - 1;
		if (entry > playlist.length - 1 || position > playlist.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  The playlist only has ${playlist.length - 1} entr${playlist.length - 1 === 1 ? 'y' : 'ies'}.`; // eslint-disable-line max-len
		if (entry === position) throw `${this.client.constants.EMOTES.xmark}  ::  What's the point of moving a playlist to the same position?`;
		playlist.splice(position, 0, playlist.splice(entry, 1)[0]);
		await this.client.providers.default.update('music', msg.guild.id, { playlist });
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully moved item \`#${entry + 1}\` to position \`#${position + 1}\`.`);
	}

	async shuffle(msg) {
		if (!await msg.hasAtLeastPermissionLevel(5)) throw `${this.client.constants.EMOTES.xmark}  ::  Only DJs can configure the playlist!`;
		const { playlist = [] } = await this.client.providers.default.get('music', msg.guild.id) || {};
		if (!playlist.length) throw `${this.client.constants.EMOTES.xmark}  ::  There are no songs in the playlist. Add one with \`${msg.guild.settings.get('prefix')}playlist add\``;
		if (playlist.length === 1) throw `${this.client.constants.EMOTES.xmark}  ::  There is only one playlist item... I have nothing to shuffle!`;
		this.client.providers.default.update('music', msg.guild.id, {
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
		msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully shuffled the playlist. Check it out with \`${msg.guild.settings.get('prefix')}playlist\``);
	}

	async addToPlaylist(msg, items) {
		const { playlist = [] } = await this.client.providers.default.get('music', msg.guild.id) || {};
		if (Array.isArray(items)) {
			let songCount = 0;
			for (const track of items) {
				if (playlist.length >= msg.guild.settings.get('music.maxPlaylist')) break;
				if (msg.guild.settings.get('donation') < 5 && track.info.length > 18000000) continue;
				playlist.push(mergeObjects(track, { requester: msg.author.id, incognito: false }));
				songCount++;
			}
			msg.send(`🎶  ::  **${songCount} song${songCount === 1 ? '' : 's'}** ha${songCount === 1 ? 's' : 've'} been added to the playlist.`); // eslint-disable-line max-len
			if (songCount < items.length) msg.channel.send(`⚠  ::  Not all songs were added. Possibilities: (1) You've reached the playlist limit of ${msg.guild.settings.get('music.maxPlaylist')} songs, or (2) all songs longer than 5 hours weren't added. View limits via \`${msg.guild.settings.get('prefix')}conf show music\`.`); // eslint-disable-line max-len
		} else {
			if (playlist.length >= msg.guild.settings.get('music.maxPlaylist')) throw `${this.client.constants.EMOTES.xmark}  ::  The music playlist for **${msg.guild.name}** has reached the limit of ${msg.guild.settings.get('music.maxPlaylist')} songs; currently ${playlist.length}. Change limit via \`${msg.guild.settings.get('prefix')}conf set music.maxPlaylist <new limit>\`.`; // eslint-disable-line max-len
			playlist.push(mergeObjects(items, { requester: msg.author.id, incognito: false }));
			msg.send(`🎶  ::  **${items.info.title}** has been added to the playlist.`);
		}
		await this.client.providers.default.update('music', msg.guild.id, { playlist }, true);
		return playlist;
	}

};
