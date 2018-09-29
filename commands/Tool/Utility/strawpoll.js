const { Command } = require('klasa');
const snekfetch = require('snekfetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Makes a strawpoll with a given title and at least two options!',
			extendedHelp: 'Please be noted that the options are also separated by `|`.',
			usage: '<PollTitle:string> <Options:string> [...]',
			usageDelim: ' | '
		});
	}

	async run(msg, [title, ...options]) {
		if (options.length < 2 | options.length > 30) throw '<:redTick:399433440975519754>  ::  There must be at least two (2) options and thirty (30) options at most!';
		snekfetch.post('https://strawpoll.me/api/v2/polls')
			.query({
				title,
				options,
				captcha: true
			})
			.then(strawpoll => msg.send(`📊  ::  Your poll is now at https://www.strawpoll.me/${strawpoll.id}`))
			.catch(() => msg.send('<:redTick:399433440975519754>  ::  Sorry! An error occured; we could not post to strawpoll.'));
	}

};
