const { Command } = require('klasa');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Returns a random reddit post on a given subreddit.',
			usage: '<Subreddit:str>'
		});
		this.errorMessage = "There was an error. Reddit may be down, or the subreddit doesn't exist.";
	}

	async run(msg, [subreddit]) {
		const { data } = await fetch(`https://www.reddit.com/r/${subreddit}/random.json`)
			.then(res => res.json())
			.then(res => {
				if (res.error) throw this.errorMessage;
				return res[0].data.children[0];
			})
			.catch(() => { throw this.errorMessage; });

		if (data.over_18 && !msg.channel.nsfw) throw "I can't post a NSFW image in this channel unless you mark it as NSFW!";

		return msg.sendMessage(data.url);
	}

};
