const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			description: 'Moves a queue entry to a specified position in the queue.',
			extendedHelp: 'If you want to move e.g. entry #3 to position #7, do `s.move 3 7`',
			usage: '<QueueEntry:integer> <NewPosition:integer>',
			usageDelim: ' '
		});
	}

	async run(msg, [entry, position]) {
		const { queue } = await this.client.providers.default.get('music', msg.guild.id);
		if (queue.length < 3) throw '<:error:508595005481549846>  ::  There is no queue entry to move.';
		if (!entry || !position) throw `<:error:508595005481549846>  ::  Moving ${!position ? 'to ' : ''}the current song playing is not allowed.`;
		if (entry > queue.length - 1 || position > queue.length - 1) throw `<:error:508595005481549846>  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`;
		if (entry === position) throw '<:error:508595005481549846>  ::  What\'s the point of moving a queue entry to the same position?';
		queue.splice(position, 0, queue.splice(entry, 1)[0]);
		await this.client.providers.default.update('music', msg.guild.id, { queue });
		return msg.send(`<:check:508594899117932544>  ::  Successfully moved entry \`#${entry}\` to position \`#${position}\`.`);
	}

};
