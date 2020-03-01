const { Task } = require('klasa');

module.exports = class extends Task {

	async run({ channel, user, text, forceChannel }) {
		const _channel = this.client.channels.cache.get(channel);
		const _user = await this.client.users.fetch(user);
		const _text = text ? `me to remind you: ${text}` : 'to be reminded!';
		const reminder = forceChannel ? `Hey there, people of ${_channel}! You wanted ${_text}` : `Hey there, ${_user}! You wanted ${_text}`;
		if (!_channel) return null;
		if (forceChannel) return _channel.send(reminder).catch(() => null);
		else return _user.send(reminder).catch(() => _channel.send(reminder).catch(() => null));
	}

};
