const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['lie', 'liedetector'],
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Detects a lie. Are you/they lying? Hmm... <:thonk:332119390365548545>',
			extendedHelp: [
				'To detect a lie, provide a text.',
				'If you mentioned someone and did not give a text, the bot will try to get their last message and detect a lie from that.',
				"If you mentioned someone and gave a text, the bot will detect that person's lie using the text your provide. e.g. `s.liedetect @Stalwartle that's what he said`",
				'\nIf you want to force the results, use the `--force` flag. To use the flag, put `--force=lie` or `--force=truth`.'
			].join('\n'),
			usage: '[Liar:member] (Lie:string) [...]',
			usageDelim: ' '
		});

		this.createCustomResolver('string', async (arg, possible, msg, [member]) => {
			if (!arg) {
				if (member) {
					return await msg.channel.messages.fetch(member.lastMessageID)
						.then(mg => mg.content)
						.catch(() => { throw "<:error:508595005481549846>  ::  Whoops... that person hasn't messaged this channel for quite some time..."; });
				} else {
					throw '<:error:508595005481549846>  ::  Um... what lie will I judge? 🤔';
				}
			}
			return arg;
		});
	}

	async run(msg, [member, ...text]) {
		const gifs = {
			truth: ['https://media.giphy.com/media/bGhDz0BM8l3MY/giphy.gif', 0x2ECC71],
			lie: ['https://media.giphy.com/media/FylwVNvkILyTu/giphy.gif', 0xE74C3C]
		};
		const gif = msg.flagArgs.force && ['truth', 'lie'].includes(msg.flagArgs.force) ? gifs[msg.flagArgs.force] : Object.values(gifs)[Math.round(Math.random())];

		if (member && text.length > 1) text.unshift(member);
		const embed = new MessageEmbed()
			.setColor(gif[1])
			.setImage(gif[0])
			.setAuthor(`${this.client.user.username}'s Lie Detector`, this.client.user.displayAvatarURL())
			.setDescription(text.join(this.usageDelim))
			.setFooter(`It's ${gif[1] === 0x2ECC71 ? 'the truth' : 'a lie'}!`);

		msg.send(embed);
	}

};
