const { Argument, util: { regExpEsc } } = require('@sapphire/framework');
const { Channel, Message } = require('discord.js');

const CHANNEL_REGEXP = Argument.regex.channel;

module.exports = class extends Argument {

	async run(arg, possible, msg) {
		if (!msg.guild) return this.store.get('channel').run(arg, possible, msg);
		const resChannel = this.resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const channel of msg.guild.channels.cache.values()) {
			if (reg.test(channel.name)) results.push(channel);
		}

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(channel => regWord.test(channel.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `${this.client.constants.EMOTES.xmark}  ::  \`${possible.name}\` must be a valid name, ID, or channel mention.`;
			case 1: return querySearch[0];
			default: throw `Found multiple matches: ${querySearch.map(result => `\`#${result.name}\` (\`${result.id}\`)`).join(', ')}`;
		}
	}

	resolveChannel(query, guild) {
		if (query instanceof Channel) return guild.channels.cache.has(query.id) ? query : null;
		if (query instanceof Message) return query.guild.id === guild.id ? query.channel : null;
		if (typeof query === 'string' && CHANNEL_REGEXP.test(query)) return guild.channels.cache.get(CHANNEL_REGEXP.exec(query)[1]);
		return null;
	}

};
