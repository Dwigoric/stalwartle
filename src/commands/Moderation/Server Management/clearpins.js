const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			runIn: ['text'],
			permissionLevel: 7,
			description: 'Unpins all pinned messages in the text channel.',
			usage: '[TextChannel:channel]'
		});
	}

	async run(msg, [channel = msg.channel]) {
		const pinnedMessages = await channel.messages.fetchPinned(false);
		if (!pinnedMessages.size) throw `<:error:508595005481549846>  ::  There are no pinned messages in ${channel}.`;
		await msg.send('<a:loading:430269209415516160>  ::  Unpinning messages...');
		pinnedMessages.each(pinned => pinned.unpin());
		msg.send(`<:check:508594899117932544>  ::  Successfully unpinned messages from ${channel}!`);
	}

};
