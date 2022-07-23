const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');

module.exports = class extends ScheduledTask {

    async run({ channel, user, text, forceChannel }) {
        const _channel = this.container.client.channels.cache.get(channel);
        const _user = await this.container.client.users.fetch(user);
        const _text = text ? `remind you: ${text}` : 'give this reminder. (No details provided)';
        const reminder = forceChannel ?
            `Hey there, people of ${_channel}! **${_user.tag}** wanted me to ${_text}` :
            `Hey there, ${_user}! You wanted me to ${_text}`;
        const parseMentions = ['roles', 'users'];

        if (!_channel) return null;
        if (this.container.stores.get('gateways').get('guildGateway').get(_channel.guild.id).allowRemindEveryone) parseMentions.push('everyone');

        return forceChannel ? _channel.send({ content: reminder, allowedMentions: { parse: parseMentions } }).catch(() => null) : _user.send(reminder).catch(() => _channel.send(reminder).catch(() => null));
    }

};
