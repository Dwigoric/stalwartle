const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['man'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gets information of a manga series from MyAnimeList.'
        });
        this.usage = '<Manga:string>';
    }

    async messageRun(msg, args) {
        let keyword = await args.restResult('string');
        if (!keyword.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the manga you want to search.`);
        keyword = keyword.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading manga...`);

        const params = new URLSearchParams();
        params.set('q', keyword);
        params.set('limit', 1);
        const search = await fetch(`https://api.jikan.moe/v3/search/manga?${params}`)
            .then(res => res.json())
            .then(body => body.results)
            .catch(() => null);
        if (search === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There was an error searching for a manga series.`);
        if (!search || !search.length) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Manga not found!`);

        const [manga] = search;

        return reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(manga.title)
                .setThumbnail(manga.image_url)
                .setDescription(manga.synopsis)
                .setURL(manga.url)
                .addField('Volumes', String(manga.volumes), true)
                .addField('Chapters', String(manga.chapters), true)
                .addField('Score', String(manga.score), true)]
        });
    }

};
