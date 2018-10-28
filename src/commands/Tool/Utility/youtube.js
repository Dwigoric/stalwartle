const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const { googleAPIkey } = require('../../../auth');
const snekfetch = require('snekfetch');
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
		const res = await snekfetch.get('https://www.googleapis.com/youtube/v3/search')
			.query({
				key: googleAPIkey,
				part: 'snippet',
				maxResults: 1,
				q: query.join(this.usageDelim), // eslint-disable-line id-length
				type
			});

		if (!res || !res.body.items || !res.body.items.length) throw '<:redTick:399433440975519754>  ::  YouTube query not found!';

		const embed = new MessageEmbed(),
			request = res.body.items[0];

		embed
			.setAuthor(`YouTube ${type.toTitleCase()}`, 'https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/youtube-512.png')
			.setTitle(request.snippet.title)
			.setURL(`https://www.youtube.com/${url}${request.id[`${type}Id`]}`)
			.setColor('RANDOM');
		if (request.snippet.thumbnails) embed.setImage(request.snippet.thumbnails.high.url);
		if (type !== 'channel') {
			embed
				.setThumbnail(await snekfetch.get('https://www.googleapis.com/youtube/v3/channels')
					.query({
						key: googleAPIkey,
						part: 'snippet',
						maxResults: 1,
						id: request.snippet.channelId
					})
					.then(result => result.body.items.length ? result.body.items[0].snippet.thumbnails.high.url : undefined))
				.addField('Channel', `[${request.snippet.channelTitle}](https://www.youtube.com/channel/${request.snippet.channelId})`, true);
		}
		embed.addField('Published', moment(request.snippet.publishedAt).tz(timezone).format('dddd, LL | LTS'))
			.addField('Description', request.snippet.description ? request.snippet.description : 'No Description');

		return msg.send(embed);
	}

};
