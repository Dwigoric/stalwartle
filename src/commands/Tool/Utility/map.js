const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Gives map information of a search location, with map zoom.',
			extendedHelp: 'To change zoom, use `--zoom=(integer)` e.g. `s.map Tokyo, Japan --zoom=24`',
			usage: '<Location:string>'
		});
	}

	async run(msg, [location]) {
		await msg.send('<a:loading:430269209415516160>  ::  Loading map...');
		const zoom = msg.flags.zoom ? parseInt(msg.flags.zoom) : 12;
		const { data } = await fetch(`https://api.ksoft.si/kumo/gis?q=${encodeURIComponent(location)}&include_map=true&map_zoom=${isNaN(zoom) ? 12 : zoom}`, { headers: { Authorization: `Bearer ${this.client.auth.ksoftAPIkey}` } }).then(res => res.json()); // eslint-disable-line max-len
		if (!data) throw '<:error:508595005481549846>  ::  I could not find that location.';
		msg.send({
			embed: new MessageEmbed()
				.setColor('RANDOM')
				.setTitle('🗺 Map Information')
				.setTimestamp()
				.setImage(data.map)
				.addField('Address', data.address)
				.addField('Latitude', data.lat, true)
				.addField('Longitude', data.lon, true)
		});
	}

};
