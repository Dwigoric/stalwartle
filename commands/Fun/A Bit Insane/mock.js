const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Converts a text into a mock-type one.',
			extendedHelp: [
				'To mockify a text, provide a text.',
				'If you want to mock someone, provide their user tag, username, nickname, user ID, or mention them.',
				'If you mentioned someone and did not give a text, the bot will try to get their last message and mockify that.',
				'If you mentioned someone and gave a text, the bot will mock that person using the text your provide. e.g. `s.mock @Stalwartle that\'s what he said`'
			].join('\n'),
			usage: '[MockUser:member] (MockText:string) [...]',
			usageDelim: ' '
		});

		this.createCustomResolver('string', async (arg, possible, msg, [member]) => {
			if (!arg) {
				if (member) {
					try {
						const message = await msg.channel.messages.fetch(member.lastMessageID).then(mg => mg.content);
						if (!message) throw "<:redTick:399433440975519754>  ::  Whoops! That user's message has either no content or just an embed... I can't mockify embeds.";
						return this.client.idiot.mock(message);
					} catch (err) {
						throw "<:redTick:399433440975519754>  ::  Whoops... that person hasn't messaged this channel for quite some time...";
					}
				} else { throw '<:redTick:399433440975519754>  ::  Um... what exactly am I going to mockify? 👀'; }
			}
			return this.client.idiot.mock(arg);
		});
	}

	async run(msg, [member, ...text]) {
		msg.send(`<:mock:445945366295347210>  ::  ${member ? `${member}: ` : ''}${text.join(this.usageDelim)}`);
	}

};
