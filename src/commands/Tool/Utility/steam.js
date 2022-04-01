const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const SteamAPI = require('steamapi');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { reply } = require('@sapphire/plugin-editable-commands');
const { toTitleCase } = require('@sapphire/utilities');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives information about a game on Steam.'
        });
        this.usage = '<Game:string>';
    }

    async messageRun(msg, args) {
        let game = await args.restResult('string');
        if (!game.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the game title you want to search for.`);
        game = game.value;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading game from Steam...`);

        const params = new URLSearchParams();
        params.set('term', game);
        const steam = new SteamAPI(process.env.STEAM_API_KEY), // eslint-disable-line no-process-env
            embed = new MessageEmbed(),
            steamSearch = await fetch(`http://store.steampowered.com/search?${params}`).then(res => res.text()).catch(() => null);

        if (steamSearch) {
            const hrefData = cheerio.load(steamSearch)('#search_result_container > #search_resultsRows > .search_result_row').attr('href');

            if (!hrefData) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Steam game not found!`);

            const gameID = hrefData.split('/')[4],
                steamData = await steam.getGameDetails(gameID).catch(() => null);
            if (steamData === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I could not find that game in Steam.`);

            const genres = [],
                platforms = [];

            const platformsObj = {
                windows: 'Windows',
                mac: 'MacOS',
                linux: 'Linux'
            };
            ['windows', 'mac', 'linux'].forEach(platform => {
                if (steamData.platforms[platform]) platforms.push(platformsObj[platform]);
            });
            if (steamData.genres) steamData.genres.forEach(genre => genres.push(genre.description));

            embed
                .setColor('RANDOM')
                .setTitle(steamData.name)
                .setURL(`http://store.steampowered.com/app/${steamData.steam_appid}/`)
                .setImage(steamData.header_image)
                .setDescription(cheerio.load(steamData.short_description).text())
                .addField(
                    'Price',
                    steamData.price_overview ?
                        `${(steamData.price_overview.final / 100).toFixed(2)} ${steamData.price_overview.currency}` :
                        'Free',
                    true)
                .addField(`Available Platform${platforms.length === 1 ? '' : 's'}`, platforms.join(', '), true)
                .addField('Controller Support', steamData.controller_support ? toTitleCase(steamData.controller_support) : 'None', true)
                .addField('Age Limit', steamData.required_age !== 0 ? String(steamData.required_age) : 'Everyone', true)
                .addField(`Genre${genres.length === 1 ? '' : 's'}`, String(genres.length) ? genres.join(', ') : 'N/A')
                .addField(`Publisher${steamData.publishers.length === 1 ? '' : 's'}`, steamData.publishers.join('\n').length ? steamData.publishers.join('\n') : 'N/A', true);

            if (steamData.developers) embed.addField(`Developer${steamData.developers.length === 1 ? '' : 's'}`, steamData.developers.join('\n').length ? steamData.developers.join('\n') : 'N/A', true);
            if (steamData.release_date.date) embed.addField('Date Released', steamData.release_date.date, true);
            return reply(msg, { embeds: [embed] });
        }

        return null;
    }

};
