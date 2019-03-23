const { Command } = require('klasa');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['purge'],
			permissionLevel: 6,
			requiredPermissions: ['MANAGE_MESSAGES'],
			runIn: ['text'],
			description: 'Prunes a certain amount of messages w/o filter.',
			usage: '[Limit:integer{,500}] [link|invite|bots|you|me|upload|user:user]',
			usageDelim: ' ',
			cooldown: 60
		});
	}

	async run(msg, [msgLimit = 50, filter = null]) {
		let messages = await msg.channel.messages.fetch({ limit: 1 });
		while (msgLimit > 0) {
			const limit = msgLimit % 100 || 100;
			messages = messages.concat(await msg.channel.messages.fetch({ limit, before: messages.last().id }));
			msgLimit -= limit;
		}
		if (filter) {
			const user = typeof filter !== 'string' ? filter : null;
			const type = typeof filter === 'string' ? filter : 'user';
			messages = messages.filter(this.getFilter(msg, type, user));
		}
		let deleted = 0;
		messages.forEach(message => {
			message.delete().catch(() => deleted--);
			deleted++;
		});
		return msg.send(`<:check:508594899117932544>  ::  Successfully deleted ${deleted - 1} messages from ${messages.size - 1}.`);
	}

	getFilter(msg, filter, user) {
		switch (filter) {
			case 'link':
				return mes => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
			case 'invite':
				return mes => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/i.test(mes.content);
			case 'bots':
				return mes => mes.author.bot;
			case 'you':
				return mes => mes.author.id === this.client.user.id;
			case 'me':
				return mes => mes.author.id === msg.author.id;
			case 'upload':
				return mes => mes.attachments.size > 0;
			case 'user':
				return mes => mes.author.id === user.id;
			default:
				return () => true;
		}
	}

};
