const { Command } = require('klasa');
const { googleAPIkey } = require('../../../auth');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['CONNECT', 'SPEAK'],
			description: 'Plays music on a voice channel.',
			usage: '<YouTubeLink:url|Song:integer|Query:string>'
		});
	}

	async run(msg, [song]) {
		if (!msg.member.voice.channel) throw '<:error:508595005481549846>  ::  Please connect to a voice channel first.';
		msg.member.voice.channel.join();
		let url;
		if (ytdl.validateURL(String(song))) {
			url = song;
		} else if (typeof song === 'number') {
			const info = await ytdl.getBasicInfo(msg.member.queue[song - 1]);
			if (parseInt(info.length_seconds) > 18000) throw `<:error:508595005481549846>  ::  **${info.title}** is longer than 5 hours.`;
			url = msg.member.queue[song - 1];
			msg.member.clearPrompt();
		} else {
			const params = [];
			for (const [key, value] of Object.entries({
				key: googleAPIkey,
				type: 'video',
				part: 'snippet',
				q: encodeURIComponent(song) // eslint-disable-line id-length
			})) params.push(`${key}=${value}`);
			const videos = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.join('&')}`).then(res => res.json()).then(res => res.items);
			msg.member.addPrompt(videos.map(vid => `https://youtu.be/${vid.id.videoId}`));
			return msg.send([
				`🎶  ::  Please pick the number of the video you want to play: \`${msg.guildSettings.get('prefix')}play <number>\``,
				videos.map((vid, index) => `\`${index + 1}\`. **${vid.snippet.title}** by ${vid.snippet.channelTitle}`).join('\n')
			].join('\n'));
		}
		return this.play(msg, url);
	}

	async addToQueue(msg, queue = [], url) {
		queue.push(url);
		this.client.providers.default.update('music', msg.guild.id, { queue });
		msg.send(`🎶  ::  **${await ytdl.getBasicInfo(url).then(info => info.title)}** has been added to the queue.`);
	}

	async play(msg, song) {
		if (!msg.flags.force && msg.guild.voiceConnection.dispatcher && msg.guild.voiceConnection.dispatcher.writable) return this.addToQueue(msg, await this.client.providers.default.get('music', msg.guild.id).then(ms => ms.queue), song); // eslint-disable-line max-len
		msg.guild.voiceConnection.play(ytdl(song, { quality: 'highestaudio' })).on('end', async () => {
			const { queue } = await this.client.providers.default.get('music', msg.guild.id);
			queue.shift();
			this.client.providers.default.update('music', msg.guild.id, { queue });
			if (queue.length) {
				this.play(msg, queue[0]);
			} else {
				msg.channel.send('👋  ::  Music session has ended! Thanks for listening!');
				msg.guild.voiceConnection.dispatcher.destroy();
				msg.guild.me.voice.channel.leave();
			}
		});
		const info = await ytdl.getBasicInfo(song);
		return msg.channel.send(`🎧  ::  Now Playing: **${info.title}** by ${info.author.name}`);
	}

	async init() {
		const defProvider = this.client.providers.default;
		if (!await defProvider.hasTable('music')) defProvider.createTable('music');
	}

};
