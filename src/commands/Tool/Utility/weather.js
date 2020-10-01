const { Command, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives weather information of a search location; can be currently, minutely, hourly, or daily.',
			extendedHelp: 'To change report type (daily/hourly/minutely/currently), use a subcommand e.g. `s.weather daily Tokyo, Japan`. Default is the current weather.',
			usage: '<daily|hourly|minutely|currently:default> <Location:string> [...]',
			usageDelim: ' ',
			subcommands: true
		});
	}

	async currently(msg, [...location]) {
		await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading current weather information...`);

		const data = await this.getWeatherData(location.join(this.usageDelim), 'currently');
		msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('🌡 Weather Report')
				.setFooter(`${data.summary} | Powered by ksoft.si`)
				.setTimestamp(data.time)
				.setThumbnail(data.icon_url)
				.addField('Address', data.location.address)
				.addField('Latitude', data.location.lat, true)
				.addField('Longitude', data.location.lon, true)
				.addField('Precipitation Intensity', `${data.precipIntensity * 100}%`, true)
				.addField('Precipitation Probability', `${data.precipProbability * 100}%`, true)
				.addField('Temperature', `${data.temperature}°C (${(data.temperature * (9 / 5)) + 32}°F)`, true)
				.addField('Apparent Temperature', `${data.apparentTemperature}°C (${(data.apparentTemperature * (9 / 5)) + 32}°F)`, true)
				.addField('Dewpoint', data.dewPoint, true)
				.addField('Humidity', `${data.humidity}g/m³`, true)
				.addField('Pressure', `${data.pressure} pascal`, true)
				.addField('Wind Speed', `${data.windSpeed} km/h`, true)
				.addField('Wind Gust', `${data.windGust} km/h`, true)
				.addField('Cloud Cover', `${data.cloudCover * 100}%`, true)
				.addField('UV Index', data.uvIndex, true)
				.addField('Visibility', data.visibility, true)
				.addField('Ozone', data.ozone, true)
		});
	}

	async minutely(msg, [location]) {
		if (!msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) throw `${this.client.constants.EMOTES.xmark}  ::  I need to be able to **Manage Messages** (permissions).`;

		const data = await this.getWeatherData(location.join(this.usageDelim), 'minutely');
		if (!data.by_minute || !data.by_minute.length) throw `${this.client.constants.EMOTES.xmark}  ::  No by-minute data available for **${data.location.address}**.`;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the weather reports...`);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('🌡 Minutely Weather Report')
			.setDescription('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.addField('Address', data.location.address)
			.addField('Latitude', data.location.lat, true)
			.addField('Longitude', data.location.lon, true))
			.setFooterSuffix(` | ${data.summary}`);

		for (const report of data.by_minute) {
			display.addPage(template => template
				.setTimestamp(report.time)
				.setThumbnail(report.icon_url)
				.addField('Precipitation Intensity', `${report.precipIntensity * 100}%`, true)
				.addField('Precipitation Probability', `${report.precipProbability * 100}%`, true));
		}
		display.run(message, { filter: (reaction, author) => msg.author === author });
	}

	async hourly(msg, [location]) {
		if (!msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) throw `${this.client.constants.EMOTES.xmark}  ::  I need to be able to **Manage Messages** (permissions).`;

		const data = await this.getWeatherData(location.join(this.usageDelim), 'hourly');
		if (!data.by_hour || !data.by_hour.length) throw `${this.client.constants.EMOTES.xmark}  ::  No by-hour data available for **${data.location.address}**.`;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the weather reports...`);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('🌡 Hourly Weather Report')
			.setDescription('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.addField('Address', data.location.address)
			.addField('Latitude', data.location.lat, true)
			.addField('Longitude', data.location.lon, true));

		for (const report of data.by_hour) {
			display.addPage(template => template
				.setTimestamp(report.time)
				.setThumbnail(report.icon_url)
				.addField('Precipitation Intensity', `${report.precipIntensity * 100}%`, true)
				.addField('Precipitation Probability', `${report.precipProbability * 100}%`, true)
				.addField('Temperature', `${report.temperature}°C (${(report.temperature * (9 / 5)) + 32}°F)`, true)
				.addField('Apparent Temperature', `${report.apparentTemperature}°C (${(report.apparentTemperature * (9 / 5)) + 32}°F)`, true)
				.addField('Dewpoint', report.dewPoint, true)
				.addField('Humidity', `${report.humidity}g/m³`, true)
				.addField('Pressure', `${report.pressure} pascal`, true)
				.addField('Wind Speed', `${report.windSpeed} km/h`, true)
				.addField('Wind Gust', `${report.windGust} km/h`, true)
				.addField('Cloud Cover', `${report.cloudCover * 100}%`, true)
				.addField('UV Index', report.uvIndex, true)
				.addField('Visibility', report.visibility, true)
				.addField('Ozone', report.ozone, true))
				.setFooterSuffix(` | ${report.summary}`);
		}
		display.run(message, { filter: (reaction, author) => msg.author === author });
	}

	async daily(msg, [location]) {
		if (!msg.channel.permissionsFor(this.client.user).has('MANAGE_MESSAGES')) throw `${this.client.constants.EMOTES.xmark}  ::  I need to be able to **Manage Messages** (permissions).`;

		const data = await this.getWeatherData(location.join(this.usageDelim), 'daily');
		if (!data.by_day || !data.by_day.length) throw `${this.client.constants.EMOTES.xmark}  ::  No by-day data available for **${data.location.address}**.`;
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading the weather reports...`);
		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('🌡 Daily Weather Report')
			.setDescription('Use reactions to go to next/previous page, go to specific page, or stop the reactions.')
			.addField('Address', data.location.address)
			.addField('Latitude', data.location.lat, true)
			.addField('Longitude', data.location.lon, true));

		for (const report of data.by_day) {
			display.addPage(template => template
				.setTimestamp(report.time)
				.setThumbnail(report.icon_url)
				.addField('Precipitation Intensity', `${report.precipIntensity * 100}%`, true)
				.addField('Maximum Precipitation Intensity', `${report.precipIntensityMax * 100}%`, true)
				.addField('Precipitation Probability', `${report.precipProbability * 100}%`, true)
				.addField('Minimum Temperature', `${report.temperatureMin}°C (${(report.temperatureMin * (9 / 5)) + 32}°F)`, true)
				.addField('Maximum Temperature', `${report.temperatureMax}°C (${(report.temperatureMax * (9 / 5)) + 32}°F)`, true)
				.addField('Min Apparent Temperature', `${report.apparentTemperatureMin}°C (${(report.apparentTemperatureMin * (9 / 5)) + 32}°F)`, true)
				.addField('Max Apparent Temperature', `${report.apparentTemperatureMax}°C (${(report.apparentTemperatureMax * (9 / 5)) + 32}°F)`, true)
				.addField('Dewpoint', report.dewPoint, true)
				.addField('Humidity', `${report.humidity}g/m³`, true)
				.addField('Pressure', `${report.pressure} pascal`, true)
				.addField('Wind Speed', `${report.windSpeed} km/h`, true)
				.addField('Wind Gust', `${report.windGust} km/h`, true)
				.addField('Cloud Cover', `${report.cloudCover * 100}%`, true)
				.addField('UV Index', report.uvIndex, true)
				.addField('Visibility', report.visibility, true)
				.addField('Ozone', report.ozone, true))
				.setFooterSuffix(` | ${report.summary}`);
		}
		display.run(message, { filter: (reaction, author) => msg.author === author });
	}

	async getWeatherData(location, type) {
		const params = new URLSearchParams();
		params.set('q', location);
		params.set('units', 'si');
		const { data } = await fetch(`https://api.ksoft.si/kumo/weather/${type}?${params}`, { headers: { Authorization: `Bearer ${this.client.auth.ksoftAPIkey}` } }) // eslint-disable-line max-len
			.then(res => res.json())
			.catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  An error occured. Please make sure you're giving a valid location and try again.`; });
		if (!data) throw `${this.client.constants.EMOTES.xmark}  ::  I could not find that location.`;
		return data;
	}

};
