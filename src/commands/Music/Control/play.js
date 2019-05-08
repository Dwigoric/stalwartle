const { Command, Timestamp, util: { mergeObjects } } = require('klasa');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const fetch = require('node-fetch');
const { parse } = require('url');

const prompts = {};
const URL_REGEX = /^(https?:\/\/)?(www\.|[a-zA-Z-_]+\.)?(vimeo\.com|mixer\.com|bandcamp\.com|twitch\.tv|soundcloud\.com|youtube\.com|youtu\.?be)\/.+$/,
	YOUTUBE_PLAYLIST_REGEX = new RegExp('[&?]list=([a-z0-9-_]+)', 'i');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Plays music in the server. Accepts YouTube, SoundCloud, Vimeo, Mixer, Bandcamp, Twitch, and online radios.',
			extendedHelp: [
				'To continue playing from the current music queue (if stopped), simply do not supply any argument.',
				'To choose which channel I will announce songs, use `s.conf set music.announceChannel <channel>`.',
				'Use SoundCloud with your searches just by simply using the `--soundcloud` flag! e.g. `s.play Imagine Dragons - Natural --soundcloud`',
				'To force play a song, just use the `--force` flag. e.g. `s.play twenty one pilots - Jumpsuit --force`.',
				'\nTo insert a whole YouTube playlist into the queue, just supply the playlist link.',
				'To play directly from Vimeo, Mixer (Beam.pro), Bandcamp, or Twitch, give the video/song/stream\'s link. (or for bandcamp, song/album)',
				'To play an online radio, simply supply the radio link.',
				'To enable autoplay, use `s.conf set music.autoplay true`. This is only applicable for $8+ donators.'
			],
			usage: '[TracksURL:url|Query:string]'
		});
	}

	async run(msg, [query]) {
		if (!msg.member.voice.channel) throw '<:error:508595005481549846>  ::  Please connect to a voice channel first.';
		if (!msg.member.voice.channel.permissionsFor(msg.guild.me.id).has(['CONNECT', 'SPEAK', 'VIEW_CHANNEL'])) throw `<:error:508595005481549846>  ::  I do not have the required permissions (**Connect**, **Speak**, **View Channel**) to play music in #**${msg.member.voice.channel.name}**.`; // eslint-disable-line max-len
		if (prompts[msg.member.id]) throw '<:error:508595005481549846>  ::  You are currently being prompted. Please pick one first or cancel the prompt.';
		let queue, playlist;
		try {
			({ queue, playlist } = await this.client.providers.default.get('music', msg.guild.id)); // eslint-disable-line prefer-const
		} catch (err) {
			throw '<:error:508595005481549846>  ::  An unknown error occured. Please try again.';
		}
		if (!query) {
			if (msg.guild.player.playing) throw `<:error:508595005481549846>  ::  Music is playing in this server, however you can still enqueue a song. You can stop the music session using the \`${msg.guild.settings.get('prefix')}stop\` command.`; // eslint-disable-line max-len
			if (queue.length) {
				msg.send('🎶  ::  No search query provided, but I found tracks in the queue so I\'m gonna play it.');
				this.join(msg);
				return this.play(msg, queue[0]);
			}
			if (!playlist.length) throw `<:error:508595005481549846>  ::  There are no songs in the queue. You can use the playlist feature or add one using \`${msg.guild.settings.get('prefix')}play\``;
			this.join(msg);
			msg.send('<:check:508594899117932544>  ::  Queue is empty. The playlist has been added to the queue.');
			await this.addToQueue(msg, playlist).catch(() => { throw '<:error:508595005481549846>  ::  There was an error loading your playlist to the queue. Please try again.'; });
			return this.play(msg, playlist[0]);
		}
		const song = await this.resolveQuery(msg, query);
		delete prompts[msg.member.id];
		if (!Array.isArray(song) && msg.guild.settings.get('donation') < 5 && !song.info.isStream && song.info.length > 18000000) throw `<:error:508595005481549846>  ::  **${song.info.title}** is longer than 5 hours. Please donate $5 or more to remove this limit.`; // eslint-disable-line max-len
		if (!msg.guild.me.voice.channelID) this.join(msg);
		queue = await this.addToQueue(msg, song).catch(() => { throw '<:error:508595005481549846>  ::  There was an error adding your song to the queue. Please try again.'; });
		if (msg.flags.force && msg.guild.player.playing && await msg.hasAtLeastPermissionLevel(5)) return msg.guild.player.stop();
		return this.play(msg, queue[0]);
	}

	join({ guild, channel, member }) {
		if (!member.voice.channel) throw '<:error:508595005481549846>  ::  Please do not leave the voice channel.';
		this.client.player.leave(guild.id);
		this.client.player.join({
			host: this.client.options.nodes[0].host,
			guild: guild.id,
			channel: member.voice.channelID
		}, { selfdeaf: true });
		guild.player.on('error', error => channel.send(`<:error:508595005481549846>  ::  ${error.error}`));
	}

	async resolveQuery(msg, query) {
		const { loadType, tracks } = await this.getSongs(query, query.includes('soundcloud.com') || Boolean(msg.flags.soundcloud));
		if (loadType === 'LOAD_FAILED') throw '<:error:508595005481549846>  ::  Something went wrong when loading your search. Sorry \'bout that! Please try again.';
		else if (loadType === 'NO_MATCHES') throw '<:error:508595005481549846>  ::  No track found for your query.';
		else if (loadType === 'TRACK_LOADED') return tracks[0];
		else if (loadType === 'PLAYLIST_LOADED' && tracks.length) return tracks;
		else if (loadType === 'PLAYLIST_LOADED' && !tracks.length) throw '<:error:508595005481549846>  ::  It seems the playlist is composed of livestreams. Please try adding them individually. Thanks!';

		// From here on out, loadType === 'SEARCH_RESULT' : true
		const finds = tracks.slice(0, 5);
		prompts[msg.member.id] = finds;
		let limit = 0, choice;
		do {
			if (limit++ >= 5) {
				delete prompts[msg.member.id];
				throw '<:error:508595005481549846>  ::  Too many invalid replies. Please try again.';
			}
			choice = await msg.prompt([
				`🎶  ::  **${escapeMarkdown(msg.member.displayName)}**, please **reply** the number of the song you want to play: (reply \`cancel\` to cancel prompt)`,
				finds.map((result, index) => {
					const { length } = result.info;
					return `\`${index + 1}\`. **${escapeMarkdown(result.info.title)}** by ${escapeMarkdown(result.info.author)} \`${new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length)}\``; // eslint-disable-line max-len
				}).join('\n')
			].join('\n')).catch(() => ({ content: 'cancel' }));
		} while ((choice.content !== 'cancel' && !parseInt(choice.content)) || parseInt(choice.content) < 1 || (prompts[msg.member.id] && parseInt(choice.content) > prompts[msg.member.id].length));
		if (msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES') && choice.delete) choice.delete();
		if (choice.content === 'cancel') {
			delete prompts[msg.member.id];
			throw '<:check:508594899117932544>  ::  Successfully cancelled prompt.';
		}
		return prompts[msg.member.id][parseInt(choice.content) - 1];
	}

	async getSongs(query, soundcloud) {
		let searchString;
		if (URL_REGEX.test(query) || (parse(query).protocol && parse(query).hostname)) {
			searchString = query;
			if (YOUTUBE_PLAYLIST_REGEX.test(searchString)) searchString = `https://youtube.com/playlist?list=${YOUTUBE_PLAYLIST_REGEX.exec(searchString)[1]}`;
		} else { searchString = `${soundcloud ? 'scsearch' : 'ytsearch'}:${encodeURIComponent(query)}`; }
		return fetch(`http://${this.client.options.nodes[0].host}:${this.client.options.nodes[0].port}/loadtracks?identifier=${searchString}`, { headers: { Authorization: this.client.options.nodes[0].password } }) // eslint-disable-line max-len
			.then(res => res.json())
			.catch(err => {
				this.client.emit('wtf', err);
				throw '<:error:508595005481549846>  ::  There was an error, please try again.';
			});
	}

	/* eslint-disable complexity */
	async addToQueue(msg, song) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (msg.flags.force && await msg.hasAtLeastPermissionLevel(5)) {
			const songs = Array.isArray(song) ? song.map(track => mergeObjects(track, { requester: msg.author.id, incognito: Boolean(msg.flags.incognito) })) : [mergeObjects(song, { requester: msg.author.id, incognito: Boolean(msg.flags.incognito) })]; // eslint-disable-line max-len
			if (msg.guild.player.playing) queue.splice(1, 0, ...songs);
			else queue.splice(0, 1, ...songs);
		} else if (Array.isArray(song)) {
			let songCount = 0;
			for (const track of song) {
				if (queue.length >= msg.guild.settings.get('music.maxQueue')) break;
				if (queue.filter(request => request.requester === msg.author.id).length >= msg.guild.settings.get('music.maxUserRequests')) break;
				if (msg.guild.settings.get('music.noDuplicates') && queue.some(request => request.track === track.track)) continue;
				if (msg.guild.settings.get('donation') < 5 && track.info.length > 18000000) continue;
				queue.push(mergeObjects(track, { requester: msg.author.id, incognito: Boolean(msg.flags.incognito) }));
				songCount++;
			}
			msg.send(`🎶  ::  **${songCount} song${songCount === 1 ? '' : 's'}** ha${songCount === 1 ? 's' : 've'} been added to the queue, now at **${queue.length - 1}** entries.`);
			if (songCount < song.length) msg.channel.send(`⚠  ::  Not all songs were added. Possibilities: (1) You've reached the queue limit of ${msg.guild.settings.get('music.maxQueue')} songs, (2) all songs longer than 5 hours weren't added, (3) there were duplicates, or (4) you've reached the limit of ${msg.guild.settings.get('music.maxUserRequests')} song requests per user. View limits via \`${msg.guild.settings.get('prefix')}conf show music\`.`); // eslint-disable-line max-len
		} else {
			if (queue.length >= msg.guild.settings.get('music.maxQueue')) throw `<:error:508595005481549846>  ::  The music queue for **${msg.guild.name}** has reached the limit of ${msg.guild.settings.get('music.maxQueue')} songs; currently ${queue.length}. Change limit via \`${msg.guild.settings.get('prefix')}conf set music.maxQueue <new limit>\`.`; // eslint-disable-line max-len
			if (queue.filter(request => request.requester === msg.author.id).length >= msg.guild.settings.get('music.maxUserRequests')) throw `<:error:508595005481549846>  ::  You've reached the maximum request per user limit of ${msg.guild.settings.get('music.maxUserRequests')} requests. Change limit via \`${msg.guild.settings.get('prefix')}conf set music.maxUserRequests <new limit>\`.`; // eslint-disable-line max-len
			if (msg.guild.settings.get('music.noDuplicates') && queue.filter(request => request.track === song.track).length) throw `<:error:508595005481549846>  ::  This song is already in the queue, and duplicates are disabled in this server. Disable via \`${msg.guild.settings.get('prefix')}conf set music.noDuplicates false\`.`; // eslint-disable-line max-len
			queue.push(mergeObjects(song, { requester: msg.author.id, incognito: Boolean(msg.flags.incognito) }));
			if (!msg.channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')) {
				msg.send(`🎶  ::  **${song.info.title}** has been added to the queue to position \`${queue.length === 1 ? 'Now Playing' : `#${queue.length - 1}`}\`. For various music settings, run \`${msg.guild.settings.get('prefix')}conf show music\`. Change settings with \`set\` instead of \`show\`.`); // eslint-disable-line max-len
			} else {
				const { title, length, uri, author, isStream } = queue[queue.length - 1].info;
				const duration = queue.reduce((prev, current) => prev + (current.info.isStream ? 0 : current.info.length), 0) - (queue[queue.length - 1].info.isStream ? 0 : queue[queue.length - 1].info.length) - (msg.guild.player.playing && !queue[0].info.isStream ? msg.guild.player.state.position : 0); // eslint-disable-line max-len
				msg.sendEmbed(new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor(`Enqueued by ${msg.member.displayName} (${msg.author.tag})`, msg.author.displayAvatarURL())
					.setDescription(`[**${title}** by ${author}](${uri})`)
					.setFooter(`For various music settings, run \`${msg.guild.settings.get('prefix')}conf show music\`. Change settings with \`set\` instead of \`show\`.`)
					.addField('Queue Position', queue.length === 1 ? 'Now Playing' : queue.length - 1, true)
					.addField('Duration', isStream ? 'Livestream' : new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`).display(length), true)
					.addField('Time Left Before Playing', new Timestamp(`${duration >= 86400000 ? 'DD:' : ''}${duration >= 3600000 ? 'HH:' : ''}mm:ss`).display(duration), true));
			}
		}
		await this.client.providers.default.update('music', msg.guild.id, { queue });
		return queue;
	}
	/* eslint-enable complexity */

	async play({ guild, channel }, song) {
		if (guild.player.playing) return;
		guild.player.play(song.track);
		guild.player.pause(false);
		guild.player.volume(guild.settings.get('music.volume'));
		guild.clearVoteskips();
		guild.player.once('end', async data => {
			if (data.reason === 'REPLACED') return null;
			const { queue } = await this.client.providers.default.get('music', guild.id);
			const { items } = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${queue[0].info.identifier}&type=video&key=${this.client.auth.googleAPIkey}`).then(res => res.json()); // eslint-disable-line max-len
			if (guild.settings.get('music.repeat') === 'queue') queue.push(queue[0]);
			if (guild.settings.get('music.repeat') !== 'song') queue.shift();
			if (items && items.length) {
				const relatedVideo = items[Math.floor(Math.random() * items.length)];
				if (guild.settings.get('donation') >= 8 && guild.settings.get('music.autoplay') && !queue.length && Boolean(relatedVideo)) queue.push(mergeObjects((await this.getSongs(`https://youtu.be/${relatedVideo.id.videoId}`, false)).tracks[0], { requester: this.client.user.id, incognito: true })); // eslint-disable-line max-len
			}
			await this.client.providers.default.update('music', guild.id, { queue });
			if (queue.length) return this.play({ guild, channel }, queue[0]);
			channel.send('👋  ::  No song left in the queue, so the music session has ended! Thanks for listening!');
			return this.client.player.leave(guild.id);
		});
		if (guild.settings.get('donation') >= 3 && !song.incognito) {
			const { history } = await this.client.providers.default.get('music', guild.id);
			history.push(mergeObjects(song, { timestamp: Date.now() }));
			this.client.providers.default.update('music', guild.id, { history });
		}
		const announceChannel = guild.channels.get(guild.settings.get('music.announceChannel')) || channel;
		if (guild.settings.get('music.announceSongs')) announceChannel.send(`🎧  ::  Now Playing: **${escapeMarkdown(song.info.title)}** by ${escapeMarkdown(song.info.author)} (Requested by **${escapeMarkdown(await guild.members.fetch(song.requester).then(req => req.displayName).catch(() => this.client.users.fetch(song.requester).then(user => user.tag)))}**)`); // eslint-disable-line max-len
	}

	async init() {
		const defProvider = this.client.providers.default;
		if (!await defProvider.hasTable('music')) defProvider.createTable('music');
	}

};
