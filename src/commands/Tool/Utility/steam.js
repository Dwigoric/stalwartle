const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const SteamAPI = require('steamapi');
const { steamAPIkey } = require('../../../auth');
const snekfetch = require('snekfetch');
const cheerio = require('cheerio');
const currencySymbol = require('currency-symbol-map');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives information about a game on Steam.',
			usage: '<Game:string>'
		});
	}

	async run(msg, [game]) {
		const steam = new SteamAPI(steamAPIkey),
			embed = new MessageEmbed(),
			steamSearch = await snekfetch.get('http://store.steampowered.com/search/').query('term', game);

		if (steamSearch) {
			const $c = cheerio.load(steamSearch.text),
				hrefData = $c('#search_result_container > div:nth-child(2) > a:nth-child(2)').attr('href');

			if (!hrefData) throw '<:redTick:399433440975519754>  ::  Steam game not found!';

			const gameID = hrefData.split('/')[4],
				steamData = await steam.getGameDetails(gameID);

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
			steamData.genres.forEach(genre => genres.push(genre.description));

			embed
				.setColor('RANDOM')
				.setTitle(steamData.name)
				.setURL(`http://store.steampowered.com/app/${steamData.steam_appid}/`)
				.setImage(steamData.header_image)
				.setDescription(cheerio.load(steamData.short_description).text())
				.addField(
					steamData.price_overview ?
						`Price in ${steamData.price_overview.currency}` :
						'Price',
					steamData.price_overview ?
						`${currencySymbol(steamData.price_overview.currency)}${(steamData.price_overview.final / 100).toFixed(2)}` :
						'Free',
					true)
				.addField(`Available Platform${platforms.length === 1 ? '' : 's'}`, platforms.join(', '), true)
				.addField('Controller Support', steamData.controller_support ? steamData.controller_support.toTitleCase() : 'None', true)
				.addField('Age Limit', steamData.required_age !== 0 ? steamData.required_age : 'Everyone', true)
				.addField(`Genre${genres.length === 1 ? '' : 's'}`, genres.join(', '))
				.addField(`Developer${steamData.developers.length === 1 ? '' : 's'}`, steamData.developers, true)
				.addField(`Publisher${steamData.publishers.length === 1 ? '' : 's'}`, steamData.publishers, true);
			if (steamData.release_date.date) embed.addField('Date Released', steamData.release_date.date, true);

			msg.send(embed);
		}
	}

};
