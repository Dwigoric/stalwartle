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
		const { queue = [] } = await this.client.providers.default.get('music', msg.guild.id);
		if (queue.length < 3) throw `${this.client.constants.EMOTES.xmark}  ::  There is no queue entry to move.`;
		// eslint-disable-next-line max-len
		if (entry > queue.length - 1 || position > queue.length - 1) throw `${this.client.constants.EMOTES.xmark}  ::  The server queue only has ${queue.length - 1} entr${queue.length - 1 === 1 ? 'y' : 'ies'}.`;
		if (entry === position) throw `${this.client.constants.EMOTES.xmark}  ::  What's the point of moving a queue entry to the same position?`;
		queue.splice(position, 0, queue.splice(entry, 1)[0]);
		await this.client.providers.default.update('music', msg.guild.id, { queue });
		return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully moved **${escapeMarkdown(queue[position].info.title)}** to position \`#${position}\`. New queue at \`${msg.guild.settings.get('prefix')}queue\`.`); // eslint-disable-line max-len
	}

};
