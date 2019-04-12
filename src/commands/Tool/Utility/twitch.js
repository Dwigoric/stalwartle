const { Command, Timestamp } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

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
		await msg.send('<a:loading:430269209415516160>  ::  Loading Twitch channel...');

		const channel = await fetch(`https://api.twitch.tv/kraken/channels/${twitchName}?client_id=${this.client.auth.twitchAPIkey}`)
			.then(res => res.json())
			.then(res => {
				if (res.error) throw `<:error:508595005481549846>  ::  ${res.message}.`;
				return res;
			});

		const creationDate = this.timestamp.display(channel.created_at);
		return msg.sendEmbed(new MessageEmbed()
			.setColor(6570406)
			.setThumbnail(channel.logo)
			.setAuthor(channel.display_name, 'https://i.imgur.com/OQwQ8z0.jpg', channel.url)
			.setFooter('Click at the account name above to go to the channel.')
			.addField('Account ID', channel._id, true)
			.addField('Followers', channel.followers, true)
			.addField('Created On', creationDate, true)
			.addField('Channel Views', channel.views, true));
	}

};
