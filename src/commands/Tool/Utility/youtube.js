const { Command, util: { toTitleCase } } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { reply } = require('@sapphire/plugin-editable-commands');

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

    async messageRun(msg, [...query]) {
        return await this.query(msg, query, 'video', 'watch?v=');
    }

    async channel(msg, [...query]) {
        return await this.query(msg, query, 'channel', 'channel/');
    }

    async playlist(msg, [...query]) {
        return await this.query(msg, query, 'playlist', 'playlist?list=');
    }

    async query(msg, query, type, url) {
        await msg.send(`${this.container.constants.EMOTES.loading}  ::  Loading YouTube information...`);

        const timezone = msg.author.settings.get('timezone');

        const params = new URLSearchParams();
        params.set('key', this.container.auth.googleAPIkey);
        params.set('part', 'snippet');
        params.set('maxResults', 1);
        params.set('q', query.join(this.usageDelim));
        params.set('type', type);
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`).then(result => result.json());

        if (!res || !res.items || !res.items.length) throw `${this.container.constants.EMOTES.xmark}  ::  YouTube query not found!`;

        const embed = new MessageEmbed(),
            request = res.items[0];

        embed
            .setAuthor({ name: `YouTube ${toTitleCase(type)}`, iconURL: 'https://cdn0.iconfinder.com/data/icons/social-flat-rounded-rects/512/youtube-512.png' })
            .setTitle(request.snippet.title)
            .setURL(`https://www.youtube.com/${url}${request.id[`${type}Id`]}`)
            .setColor('RANDOM');
        if (request.snippet.thumbnails) embed.setImage(request.snippet.thumbnails.high.url);
        if (type !== 'channel') {
            params.set('id', request.snippet.channelId);
            params.delete('q');
            params.delete('type');
            embed
                .setThumbnail(await fetch(`https://www.googleapis.com/youtube/v3/channels?${params}`)
                    .then(result => result.json())
                    .then(result => result.items.length ? result.items[0].snippet.thumbnails.high.url : undefined))
                .addField('Channel', `[${request.snippet.channelTitle}](https://www.youtube.com/channel/${request.snippet.channelId})`, true);
        }
        embed.addField('Published', moment(request.snippet.publishedAt).tz(timezone).format('dddd, LL | LTS z'))
            .addField('Description', request.snippet.description ? request.snippet.description : 'No Description');

        return reply(msg, { embeds: [embed] });
    }

};
