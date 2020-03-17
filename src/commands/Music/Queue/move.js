const { Command } = require('klasa');
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Moves a queue entry to a specified position in the queue.',
			extendedHelp: 'If you want to move e.g. entry #3 to position #7, do `s.move 3 7`',
			usage: '<QueueEntry:integer{1}> <NewPosition:integer{1}>',
			usageDelim: ' '
		});
	}

	async run(msg, [entry, position]) {
		const queue = this.client.gateways.music.get(msg.guild.id, true).get('queue');
		if (queue.length < 3) throw '<:error:508595005481549846>  ::  There is no queue entry to move.';
		if (entry > queue.length - 1 || position > queue.length - 1) throw `<:error:508595005481549846>  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`;
		if (entry === position) throw '<:error:508595005481549846>  ::  What\'s the point of moving a queue entry to the same position?';
		queue.splice(position, 0, queue.splice(entry, 1)[0]);
		await this.client.gateways.music.get(msg.guild.id, true).update('queue', queue);
		return msg.send(`<:check:508594899117932544>  ::  Successfully moved **${escapeMarkdown(queue[position].info.title)}** to position \`#${position}\`. New queue at \`${msg.guild.settings.get('prefix')}queue\`.`); // eslint-disable-line max-len
	}

};
