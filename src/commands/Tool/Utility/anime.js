const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['ani'],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gets information of an anime series from MyAnimeList.',
            usage: '<Anime:string>'
        });
    }

    async messageRun(msg, [keyword]) {
        await msg.send(`${this.container.constants.EMOTES.loading}  ::  Loading anime...`);

        const params = new URLSearchParams();
        params.set('q', keyword);
        params.set('limit', 1);
        const search = await fetch(`https://api.jikan.moe/v3/search/anime?${params}`)
            .then(res => res.json())
            .then(body => body.results)
            .catch(() => { throw `${this.container.constants.EMOTES.xmark}  ::  There was an error searching for an anime series.`; });
        if (!search || !search.length) throw `${this.container.constants.EMOTES.xmark}  ::  Anime series not found!`;

        const [anime] = search;

        reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(anime.title)
                .setThumbnail(anime.image_url)
                .setDescription(anime.synopsis)
                .setURL(anime.url)
                .addField('Episodes', String(anime.episodes), true)
                .addField('Rating', String(anime.rated), true)
                .addField('Score', String(anime.score), true)]
        });
    }

};
