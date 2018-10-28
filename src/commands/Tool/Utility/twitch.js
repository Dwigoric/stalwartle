const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');
const snekfetch = require('snekfetch');

/**
 * https://dev.twitch.tv/docs/v5/guides/authentication/
 */
const clientID = require('../../../auth').twitchAPIkey;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Returns information on a Twitch.tv Account',
			usage: '<TwitchName:string>'
		});
		this.timestamp = new Timestamp('DD-MM-YYYY');
	}

	async run(msg, [twitchName]) {
		const body = await snekfetch.get(`https://api.twitch.tv/kraken/channels/${twitchName}`)
			.query('client_id', clientID)
			.then(res => res.body)
			.catch(() => { throw `<:redTick:399433440975519754>  ::  Unable to find account **${twitchName}**. Did you spell it correctly?`; });

		const creationDate = this.timestamp.display(body.created_at);
		const embed = new MessageEmbed()
			.setColor(6570406)
			.setThumbnail(body.logo)
			.setAuthor(body.display_name, 'https://i.imgur.com/OQwQ8z0.jpg', body.url)
			.setFooter('Click at the account name above to go to the channel.')
			.addField('Account ID', body._id, true)
			.addField('Followers', body.followers, true)
			.addField('Created On', creationDate, true)
			.addField('Channel Views', body.views, true);

		return msg.sendEmbed(embed);
	}

};
