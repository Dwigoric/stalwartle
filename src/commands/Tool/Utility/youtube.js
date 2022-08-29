const { Subcommand } = require('@sapphire/plugin-subcommands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { reply } = require('@sapphire/plugin-editable-commands');
const { toTitleCase } = require('@sapphire/utilities');

module.exports = class extends Subcommand {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['yt', 'ytsearch', 'yts'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Finds a video, channel, or playlist from YouTube.',
            subcommands: [
                { name: 'channel', messageRun: 'channel' },
                { name: 'playlist', messageRun: 'playlist' },
                { name: 'video', messageRun: 'video', default: true }
            ]
        });
        this.usage = '[channel|playlist] <VideoOrQuery:...string>';
    }

    async video(msg, args) {
        let query = await args.restResult('string');
        if (!query.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply your YouTube query.`);
        query = query.value;

        return await this.#query(msg, query, 'video', 'watch?v=');
    }

    async channel(msg, args) {
        let query = await args.restResult('string');
        if (!query.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply your YouTube query.`);
        query = query.value;

        return await this.#query(msg, query, 'channel', 'channel/');
    }

    async playlist(msg, args) {
        let query = await args.restResult('string');
        if (!query.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply your YouTube query.`);
        query = query.value;

        return await this.#query(msg, query, 'playlist', 'playlist?list=');
    }

    async #query(msg, query, type, url) {
        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading YouTube information...`);

        const { timezone } = this.container.stores.get('gateways').get('userGateway').get(msg.author.id);

        const params = new URLSearchParams();
        params.set('key', process.env.GOOGLE_API_KEY); // eslint-disable-line no-process-env
        params.set('part', 'snippet');
        params.set('maxResults', 1);
        params.set('q', query);
        params.set('type', type);
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`).then(result => result.json());

        if (!res || !res.items || !res.items.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  YouTube query not found!`);

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
            .addField('Description', request.snippet.description || 'No Description');

        return reply(msg, { embeds: [embed] });
    }

};
