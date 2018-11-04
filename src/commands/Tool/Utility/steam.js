const { Command, util: { toTitleCase } } = require('klasa');
const { MessageEmbed } = require('discord.js');
const SteamAPI = require('steamapi');
const { steamAPIkey } = require('../../../auth');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

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
			steamSearch = await fetch(`http://store.steampowered.com/search?term=${encodeURIComponent(game)}`).then(res => res.text()).catch(() => null);

		if (steamSearch) {
			const hrefData = cheerio.load(steamSearch)('#search_result_container > div:nth-child(2) > a:nth-child(2)').attr('href');

			if (!hrefData) throw '<:crossmark:508590460688924693>  ::  Steam game not found!';

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
					'Price',
					steamData.price_overview ?
						`${(steamData.price_overview.final / 100).toFixed(2)} ${steamData.price_overview.currency}` :
						'Free',
					true)
				.addField(`Available Platform${platforms.length === 1 ? '' : 's'}`, platforms.join(', '), true)
				.addField('Controller Support', steamData.controller_support ? toTitleCase(steamData.controller_support) : 'None', true)
				.addField('Age Limit', steamData.required_age !== 0 ? steamData.required_age : 'Everyone', true)
				.addField(`Genre${genres.length === 1 ? '' : 's'}`, genres.join(', '))
				.addField(`Developer${steamData.developers.length === 1 ? '' : 's'}`, steamData.developers, true)
				.addField(`Publisher${steamData.publishers.length === 1 ? '' : 's'}`, steamData.publishers, true);
			if (steamData.release_date.date) embed.addField('Date Released', steamData.release_date.date, true);

			msg.send(embed);
		}
	}

};
