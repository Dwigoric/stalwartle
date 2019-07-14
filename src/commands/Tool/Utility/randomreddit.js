const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Returns a random reddit post on a given subreddit.',
			usage: '<Subreddit:str>'
		});
		this.errorMessage = "<:error:508595005481549846>  ::  There was an error. Reddit may be down, or the subreddit doesn't exist.";
	}

	async run(msg, [subreddit]) {
		await msg.send('<a:loading:430269209415516160>  ::  Loading reddit post...');
		const { data } = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`)
			.then(res => res.json())
			.then(res => {
				if (res.error) throw this.errorMessage;
				return res[0].data.children[0];
			})
			.catch(() => { throw this.errorMessage; });

		if (data.over_18 && !msg.channel.nsfw) throw '<:error:508595005481549846>  ::  The post contains NSFW content and this channel is not marked as NSFW.';

		if (!msg.channel.permissionsFor(this.client.user).has('EMBED_LINKS')) return msg.sendMessage(`***${data.title}***\n\n${data.url}`);

		return msg.sendEmbed(new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(`u/${data.author}`, null, `https://www.reddit.com/u/${data.author}`)
			.setTitle(data.title)
			.setURL(`https://www.reddit.com${data.permalink}`)
			.setImage(data.url)
			.setFooter(data.subreddit_name_prefixed)
			.setTimestamp(Date.now() - data.created_utc));
	}

};
