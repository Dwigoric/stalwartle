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
		const user = this.client.users.get(data.user_id);
		const channel = this.client.channels.get(data.channel_id) || await user.createDM();

		if (channel.messages.has(data.message_id)) return;

		const message = await channel.messages.fetch(data.message_id);
		const emojiKey = data.emoji.id ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
		const reaction = message.reactions.get(emojiKey);

		this.client.emit(this.events[event.t], reaction, user);
	}

};
