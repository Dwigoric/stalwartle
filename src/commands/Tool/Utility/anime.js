const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ani'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gets information of an anime series from MyAnimeList.'
        });
        this.usage = '<Anime:string>';
    }

    async messageRun(msg, args) {
        let keyword = await args.restResult('string');
        if (!keyword.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the anime you want to search.`);
        keyword = keyword.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading anime...`);

        const params = new URLSearchParams();
        params.set('q', keyword);
        params.set('limit', 1);
        const search = await fetch(`https://api.jikan.moe/v4/anime?${params}`)
            .then(res => res.json())
            .then(body => body.data)
            .catch(() => null);
        if (search === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There was an error searching for an anime series.`);
        if (!search || !search.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Anime series not found!`);

        const [anime] = search;

        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(anime.title)
                .setThumbnail(anime.images.webp.image_url)
                .setDescription(anime.synopsis)
                .setURL(anime.url)
                .addField('Episodes', String(anime.episodes), true)
                .addField('Rating', String(anime.rating), true)
                .addField('Score', String(anime.score), true)]
        });
    }

};
