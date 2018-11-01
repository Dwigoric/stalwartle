const { Command } = require('klasa');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sub'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Returns information on a subreddit.',
			usage: '<Subreddit:str>'
		});
	}

	async run(msg, [subredditName]) {
		let subreddit = await fetch(`https://www.reddit.com/r/${subredditName}/about.json`)
			.then(res => res.json())
			.catch(() => { throw "There was an error. Reddit may be down, or the subreddit doesn't exist."; });

		if (subreddit.kind !== 't5') throw `Subreddit ${subredditName} doesn't exist.`;
		else subreddit = subreddit.data;

		return msg.sendEmbed(new MessageEmbed()
			.setTitle(subreddit.title)
			.setDescription(subreddit.public_description)
			.setURL(`https://www.reddit.com/r/${subredditName}/`)
			.setColor(6570404)
			.setThumbnail(subreddit.icon_img)
			.setImage(subreddit.banner_img)
			.addField('Subscribers', subreddit.subscribers.toLocaleString(), true)
			.addField('Users Active', subreddit.accounts_active.toLocaleString(), true));
	}

};
