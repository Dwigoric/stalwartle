const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment-timezone');
const { reply } = require('@sapphire/plugin-editable-commands');
require('dotenv').config();

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['tvshows', 'tv', 'tvseries'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Finds a TV show on TMDB.org',
            detailedDescription: 'To search from a different page, use e.g. `--page=5` to search from page 5.',
            options: ['page']
        });
    }

    async messageRun(msg, args) {
        let query = await args.restResult('string');
        if (!query.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the TV show query.`);
        query = query.value;
        const page = parseInt(args.getOption('page')) || 1;

        const { timezone } = this.container.stores.get('gateways').get('userGateway').get(msg.author.id);
        const trim = (str, max) => str.length > max ? `${str.slice(0, max)}...` : str;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading TV show...`);

        const params = new URLSearchParams();
        params.set('api_key', process.env.TMDB_API_KEY); // eslint-disable-line no-process-env
        params.set('query', query);
        const request = await fetch(`https://api.themoviedb.org/3/search/tv?${params}`).then(res => res.json());
        const short = request.results[page - 1];
        if (!short) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I couldn't find a TV show with title **${query}** in page ${page}.`);
        params.delete('query');
        const tmdb = await fetch(`https://api.themoviedb.org/3/tv/${short.id}?${params}`).then(res => res.json());

        const poster = `https://image.tmdb.org/t/p/original${tmdb.poster_path}`;
        const url = tmdb.homepage || `https://www.themoviedb.org/tv/${tmdb.id}`;
        const runtime = tmdb.episode_run_time;
        const producers = tmdb.production_companies.map(producer => producer.name);
        const networks = tmdb.networks.map(network => network.name);
        const genres = tmdb.genres.map(genre => genre.name);
        const seasons = tmdb.seasons.map(season => `${season.name} → ${season.episode_count} Episode${season.episode_count === 1 ? '' : 's'}`);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setThumbnail(poster)
            .setTitle(`${tmdb.name} (${page} out of ${request.results.length} result${request.results.length === 1 ? '' : 's'})`)
            .setURL(url)
            .setDescription(`[Poster Here](${poster})  ::  ${trim(tmdb.overview, 1024)}`)
            .setFooter({ text: `${this.container.client.user.username} uses the TMDb API but is not endorsed nor certified by TMDb.`, iconURL: 'https://www.themoviedb.org/assets/1/v4/logos/208x226-stacked-green-9484383bd9853615c113f020def5cbe27f6d08a84ff834f41371f223ebad4a3c.png' }); // eslint-disable-line max-len
        if (tmdb.name !== tmdb.original_name) embed.addField('Original Title', tmdb.original_name, true);
        if (tmdb.origin_country.length) embed.addField('Country', tmdb.origin_country[0], true);
        embed
            .addField('Language', tmdb.original_language.toUpperCase(), true)
            .addField('Vote Count', String(tmdb.vote_count), true)
            .addField('User Score', `${+`${`${Math.round(`${`${(tmdb.vote_average / 10) * 100}e+2`}`)}e-2`}`}%`, true)
            .addField('Popularity', String(tmdb.popularity), true);
        if (runtime.length) embed.addField(`Runtime${runtime.length === 1 ? '' : 's'}`, `${runtime.join(' | ')} minutes`, true);
        if (tmdb.first_air_date) embed.addField('First Air Date', moment(tmdb.first_air_date).tz(timezone).format('dddd, LL'), true);
        if (tmdb.last_air_date) embed.addField('Last Air Date', moment(tmdb.last_air_date).tz(timezone).format('dddd, LL'), true);
        if (producers.length) embed.addField(`Production Compan${producers.length === 1 ? 'y' : 'ies'}`, producers.join('\n'), true);
        if (networks.length) embed.addField(`Network${networks.length === 1 ? '' : 's'}`, networks.join('\n'), true);
        embed
            .addField('Status', tmdb.status, true)
            .addField('In Production', tmdb.in_production ? 'Yep' : 'Nope', true);
        if (genres.length) embed.addField(`Genre${genres.length === 1 ? '' : 's'}`, genres.join(', '), true);
        if (seasons.length) embed.addField(`Season${seasons.length === 1 ? '' : 's'}`, seasons.join('\n'));

        return reply(msg, { embeds: [embed] });
    }

};
