const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.VoiceStateUpdate });
    }

    async run(oldState, newState) {
        if (!newState.member) return null;
        if (!newState.guild.me.permissions.has('MOVE_MEMBERS')) return null;
        if (!this.container.stores.get('gateways').get('guildGateway').get(newState.guild.id, 'afkChannelOnAfk')) return null;
        if (!newState.member.voice.channel) return null;
        if (!newState.guild.afkChannelId) return null;
        if (newState.channelID === newState.guild.afkChannelId) return null;
        if (!this.container.stores.get('gateways').get('afkGateway').get(newState.user.id).timestamp) return null;
        return newState.setChannel(newState.guild.afkChannelId, 'Moved to AFK channel due to AFK status');
    }

};
