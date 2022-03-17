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
            aliases: ['movies', 'film', 'films'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Finds a movie on TMDB.org',
            detailedDescription: 'To search from a different page, use e.g. `--page=5` to search from page 5.',
            options: ['page']
        });
        this.usage = '<Query:string>';
    }

    async messageRun(msg, args) {
        let query = await args.restResult('string');
        if (!query.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the movie query.`);
        query = query.value;
        const page = parseInt(args.getOption('page')) || 1;

        const { timezone } = this.container.stores.get('gateways').get('userGateway').get(msg.author.id);
        const trim = (str, max) => str.length > max ? `${str.slice(0, max)}...` : str;

        await reply(msg, `${this.container.constants.EMOTES.loading}  ::  Loading movie...`);

        const params = new URLSearchParams();
        params.set('api_key', process.env.TMDB_API_KEY); // eslint-disable-line no-process-env
        params.set('query', query);
        const { results } = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`).then(res => res.json());
        const short = results[page - 1];
        if (!short) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  I couldn't find a movie with that title in page ${page}.`);
        params.delete('query');
        const tmdb = await fetch(`https://api.themoviedb.org/3/movie/${short.id}?${params}`).then(res => res.json());

        const poster = `https://image.tmdb.org/t/p/original${tmdb.poster_path}`;
        const url = tmdb.homepage || `https://www.themoviedb.org/movie/${tmdb.id}`;
        const runtime = tmdb.runtime ? `${tmdb.runtime} minute${tmdb.runtime === 1 ? '' : 's'}` : 'Not Yet Released';
        const producers = tmdb.production_companies.map(company => company.name);
        const countries = tmdb.production_countries.map(country => country.iso_3166_1);
        const genres = tmdb.genres.map(genre => genre.name);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setThumbnail(poster)
            .setTitle(`${tmdb.title} (${page} out of ${results.length} result${results.length === 1 ? '' : 's'})`)
            .setURL(url)
            .setDescription(`[Poster Here](${poster})  ::  ${trim(tmdb.overview, 1024)}`)
            .setFooter({ text: `${this.container.client.user.username} uses the TMDb API but is not endorsed nor certified by TMDb.`, iconURL: 'https://www.themoviedb.org/assets/1/v4/logos/208x226-stacked-green-9484383bd9853615c113f020def5cbe27f6d08a84ff834f41371f223ebad4a3c.png' }); // eslint-disable-line max-len
        if (tmdb.title !== tmdb.original_title) embed.addField('Original Title', tmdb.original_title, true);
        embed
            .addField('Language', tmdb.original_language.toUpperCase(), true)
            .addField('Vote Count', String(tmdb.vote_count), true)
            .addField('User Score', `${+`${`${Math.round(`${`${(tmdb.vote_average / 10) * 100}e+2`}`)}e-2`}`}%`, true)
            .addField('Popularity', String(tmdb.popularity), true)
            .addField('Runtime', String(runtime), true)
            .addField('Adult Content', tmdb.adult ? 'Yep' : 'Nope', true);
        if (tmdb.release_date) embed.addField('Release Date', moment(tmdb.release_date).tz(timezone).format('dddd, LL'), true);
        if (producers.length) embed.addField(`Production Compan${producers.length === 1 ? 'y' : 'ies'}`, producers.join('\n'), true);
        if (countries.length) embed.addField(`Production Countr${countries.length === 1 ? 'y' : 'ies'}`, countries.join(', '), true);
        if (genres.length) embed.addField(`Genre${genres.length === 1 ? '' : 's'}`, genres.join(', '), true);

        return reply(msg, { embeds: [embed] });
    }

};
