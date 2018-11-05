const { Command, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { googleAPIkey } = require('../../../auth');
const fetch = require('node-fetch');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['yt', 'ytsearch', 'yts'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Finds a video, channel, or playlist from YouTube.',
			usage: '[channel|playlist] <VideoOrQuery:string> [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async run(msg, [...query]) {
		return await this.query(msg, query, 'video', 'watch?v=');
	}

	async channel(msg, [...query]) {
		return await this.query(msg, query, 'channel', 'channel/');
	}

	async playlist(msg, [...query]) {
		return await this.query(msg, query, 'playlist', 'playlist?list=');
	}

	async query(msg, query, type, url) {
		const { timezone } = msg.author.settings;
		const queries = [];

		for (const [key, value] of Object.entries({
			key: googleAPIkey,
			part: 'snippet',
			maxResults: 1,
			q: query.join(this.usageDelim), // eslint-disable-line id-length
			type
		})) queries.push(`${key}=${value}`);
		const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${queries.join('&')}`).then(result => result.json());

		if (!res || !res.items || !res.items.length) throw '<:error:508595005481549846>  ::  YouTube query not found!';

		const embed = new MessageEmbed(),
			request = res.items[0];

		embed
			.setAuthor(`YouTube ${toTitleCase(type)}`, 'https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/youtube-512.png')
			.setTitle(request.snippet.title)
			.setURL(`https://www.youtube.com/${url}${request.id[`${type}Id`]}`)
			.setColor('RANDOM');
		if (request.snippet.thumbnails) embed.setImage(request.snippet.thumbnails.high.url);
		if (type !== 'channel') {
			embed
				.setThumbnail(await fetch(`https://www.googleapis.com/youtube/v3/channels?key=${googleAPIkey}&part=snippet&maxResults=1&id=${request.snippet.channelId}`)
					.then(result => result.json())
					.then(result => result.items.length ? result.items[0].snippet.thumbnails.high.url : undefined))
				.addField('Channel', `[${request.snippet.channelTitle}](https://www.youtube.com/channel/${request.snippet.channelId})`, true);
		}
		embed.addField('Published', moment(request.snippet.publishedAt).tz(timezone).format('dddd, LL | LTS z'))
			.addField('Description', request.snippet.description ? request.snippet.description : 'No Description');

		return msg.send(embed);
	}

};
