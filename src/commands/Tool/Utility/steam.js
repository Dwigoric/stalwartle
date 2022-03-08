const { Command, util: { toTitleCase } } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const SteamAPI = require('steamapi');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { reply } = require('@sapphire/plugin-editable-commands');
require('dotenv').config();

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gives information about a game on Steam.',
            usage: '<Game:string>'
        });
    }

    async messageRun(msg, [game]) {
        await msg.send(`${this.container.constants.EMOTES.loading}  ::  Loading game from Steam...`);

        const params = new URLSearchParams();
        params.set('term', game);
        const steam = new SteamAPI(process.env.STEAM_API_KEY), // eslint-disable-line no-process-env
            embed = new MessageEmbed(),
            steamSearch = await fetch(`http://store.steampowered.com/search?${params}`).then(res => res.text()).catch(() => null);

        if (steamSearch) {
            const hrefData = cheerio.load(steamSearch)('#search_result_container > #search_resultsRows > .search_result_row').attr('href');

            if (!hrefData) throw `${this.container.constants.EMOTES.xmark}  ::  Steam game not found!`;

            const gameID = hrefData.split('/')[4],
                steamData = await steam.getGameDetails(gameID).catch(() => { throw `${this.container.constants.EMOTES.xmark}  ::  Sorry! I could not find that game in Steam.`; });

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
                .addField('Age Limit', steamData.required_age !== 0 ? steamData.required_age : 'Everyone', true)
                .addField(`Genre${genres.length === 1 ? '' : 's'}`, genres.length ? genres.join(', ') : 'N/A')
                .addField(`Publisher${steamData.publishers.length === 1 ? '' : 's'}`, steamData.publishers.join('\n').length ? steamData.publishers : 'N/A', true);

            if (steamData.developers) embed.addField(`Developer${steamData.developers.length === 1 ? '' : 's'}`, steamData.developers.join('\n').length ? steamData.developers : 'N/A', true);
            if (steamData.release_date.date) embed.addField('Date Released', steamData.release_date.date, true);
            reply(msg, { embeds: [embed] });
        }
    }

};
