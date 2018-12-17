const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['EMBED_LINKS'],
			description: 'Creates a poll in the current channel or in the channel you specify.',
			extendedHelp: 'The first you give is the question, then separated by `|`, you give the choices.',
			runIn: ['text'],
			usage: '[Channel:channel] <Question:string> <Choices:string> [...]',
			usageDelim: ' | '
		});
	}

	async run(msg, [chan = msg.channel, question, ...choices]) {
		if (!chan.postable) throw `<:error:508595005481549846>  ::  Sorry! I cannot send messages in that channel.`;
		if (!chan.permissionsFor(msg.author).has('VIEW_CHANNEL', true)) throw `<:error:508595005481549846>  ::  It seems you cannot send messages in that channel...`; // eslint-disable-line max-len
		if (choices.length < 2) throw '<:error:508595005481549846>  ::  Your poll must have at least two (2) choices!';
		if (choices.length > 10) throw '<:error:508595005481549846>  ::  Sorry! You can only have a maximum of ten (10) choices.';
		if (question.length > 256) throw '<:error:508595005481549846>  ::  You can only have a maximum of 256 characters in your question.';
		if (chan !== msg.channel) msg.send(`<:check:508594899117932544>  ::  Poll created!`);

		choices = choices.splice(0, 10);
		const emojis = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'].splice(0, choices.length);
		choices = choices.map((choice, index) => `${emojis[index]} ${choice}`);
		emojis.push('❓', '❌', '💯');
		choices.push('❓ What?', '❌ None of the choices', '💯 All of the choices');

		const poll = await chan.send({
			embed: new MessageEmbed()
				.setColor(0x40E0D0)
				.setAuthor(question, msg.author.displayAvatarURL())
				.setDescription(choices)
				.setFooter(`Poll started by ${msg.author.tag}`)
				.setTimestamp()
		});
		let i = 0;
		const loop = () => {
			setTimeout(() => {
				poll.react(emojis[i]);
				i++;
				if (i < emojis.length) loop();
			}, 1000);
		};
		loop();

		return poll;
	}

};
