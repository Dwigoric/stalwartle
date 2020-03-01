const { Event } = require('klasa');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, { event: 'raw' });
		this.events = {
			MESSAGE_REACTION_ADD: 'messageReactionAdd',
			MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
		};
	}

	async run(event) {
		if (!(event.t in this.events)) return;

		const { d: data } = event; // eslint-disable-line id-length
		const user = await this.client.users.fetch(data.user_id, false).catch(() => null);
		const channel = this.client.channels.cache.get(data.channel_id) || await user.createDM();

		if (channel.messages.cache.has(data.message_id)) return;

		const message = await channel.messages.fetch(data.message_id).catch(() => null);
		if (!message) return;
		const emojiKey = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		const reaction = message.reactions.cache.get(emojiKey);
		if (!reaction) return;

		this.client.emit(this.events[event.t], reaction, user);
	}

};
