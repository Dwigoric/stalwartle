const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');
const { tmdbAPIkey } = require('../../../auth');
const moment = require('moment-timezone');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['movies', 'film', 'films'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Finds a movie on TMDB.org',
			extendedHelp: 'e.g. `s.movie infinity war, 2`',
			usage: '<Query:str> [Page:number]',
			usageDelim: ', '
		});
	}

	async run(msg, [query, page = 1]) {
		const { timezone } = msg.author.settings;
		const trim = (str, max) => str.length > max ? `${str.slice(0, max)}...` : str;

		const request = await snekfetch.get('https://api.themoviedb.org/3/search/movie')
			.query({
				api_key: tmdbAPIkey, // eslint-disable-line camelcase
				query
			});
		const short = request.body.results[page - 1];
		if (!short) throw `<:redTick:399433440975519754>  ::  I couldn't find a movie with title **${query}** in page ${page}.`;
		const tmdb = await snekfetch.get(`https://api.themoviedb.org/3/movie/${short.id}`)
			.query('api_key', tmdbAPIkey)
			.then(mv => mv.body);

		const poster = `https://image.tmdb.org/t/p/original${tmdb.poster_path}`;
		const url = tmdb.homepage || `https://www.themoviedb.org/movie/${tmdb.id}`;
		const runtime = tmdb.runtime ? `${tmdb.runtime} minute${tmdb.runtime === 1 ? '' : 's'}` : 'Not Yet Released';
		const producers = tmdb.production_companies.map(company => company.name);
		const countries = tmdb.production_countries.map(country => country.iso_3166_1);
		const genres = tmdb.genres.map(genre => genre.name);
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setThumbnail(poster)
			.setTitle(`${tmdb.title} (${page} out of ${request.body.results.length} result${request.body.results.length === 1 ? '' : 's'})`)
			.setURL(url)
			.setDescription(`[Poster Here](${poster})  ::  ${trim(tmdb.overview, 1024)}`)
			.setFooter(`${this.client.user.username} uses the TMDb API but is not endorsed nor certified by TMDb.`, 'https://www.themoviedb.org/assets/1/v4/logos/208x226-stacked-green-9484383bd9853615c113f020def5cbe27f6d08a84ff834f41371f223ebad4a3c.png'); // eslint-disable-line max-len
		if (tmdb.title !== tmdb.original_title) embed.addField('Original Title', tmdb.original_title, true);
		embed
			.addField('Language', tmdb.original_language.toUpperCase(), true)
			.addField('Vote Count', tmdb.vote_count, true)
			.addField('User Score', `${+`${`${Math.round(`${`${(tmdb.vote_average / 10) * 100}e+2`}`)}e-2`}`}%`, true)
			.addField('Popularity', tmdb.popularity, true)
			.addField('Runtime', runtime, true)
			.addField('Adult Content', tmdb.adult ? 'Yep' : 'Nope', true);
		if (tmdb.release_date) embed.addField('Release Date', moment(tmdb.release_date).tz(timezone).format('dddd, LL'), true);
		if (producers.length) embed.addField(`Production Compan${producers.length === 1 ? 'y' : 'ies'}`, producers, true);
		if (countries.length) embed.addField(`Production Countr${countries.length === 1 ? 'y' : 'ies'}`, countries.join(', '), true);
		if (genres.length) embed.addField(`Genre${genres.length === 1 ? '' : 's'}`, genres.join(', '), true);

		msg.send(embed);
	}

};
