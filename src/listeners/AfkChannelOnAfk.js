const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.VoiceStateUpdate });
    }

    async run(oldState, newState) {
        if (!newState.member) return null;
        if (!newState.guild.me.permissions.has('MOVE_MEMBERS')) return null;
        if (!newState.guild.settings.get('afkChannelOnAfk')) return null;
        if (!newState.member.voice.channel) return null;
        if (!newState.guild.afkChannelID) return null;
        if (newState.channelID === newState.guild.afkChannelID) return null;
        if (!this.container.client.gateways.afk.get(newState.user.id).timestamp) return null;
        return newState.setChannel(newState.guild.afkChannelID, 'Moved to AFK channel due to AFK status');
    }

};
