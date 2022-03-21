const { Listener, Events } = require('@sapphire/framework');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.VoiceStateUpdate });
    }

    #autopaused = new Set();

    async run(oldState, newState) {
        if (!this.container.erela) return null;
        if (newState.id === this.container.client.user.id) return null;

        const player = this.container.erela.players.get(newState.guild.id);
        if (!player) return null;
        if (!newState.guild.me.voice.channelId) return player.destroy();
        if (oldState.channelId && newState.channelId && (oldState.channelId === newState.channelId || ![oldState.channelId, newState.channelId].includes(newState.guild.me.voice.channelId))) return null;

        const channelMembers = newState.guild.me.voice.channel.members.filter(mb => !mb.user.bot);
        if (!player.playing && !channelMembers.size) {
            clearTimeout(this.container.stores.get('commands').get('play').timeouts.get(newState.guild.id));
            this.container.stores.get('commands').get('play').timeouts.delete(newState.guild.id);
            return player.destroy();
        }
        if (newState.guild.me.voice.channelId && channelMembers.size && this.#autopaused.has(newState.guild.id)) {
            this.#autopaused.delete(newState.guild.id);
            return player.pause(false);
        }
        if (channelMembers.size) return null;

        const { queue } = player;
        if (!queue.current.isStream) {
            this.#autopaused.add(newState.guild.id);
            player.pause(true);
        }
        if (this.container.stores.get('gateways').get('guildGateway').get(newState.guild.id).donation >= 10) return null;
        return this.container.client.setTimeout(guild => {
            if (guild.me.voice.channel && guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return null;
            if (player) player.destroy();
            return null;
        }, 30000, newState.guild);
    }

    addAutopaused(guildID) {
        if (this.#autopaused.has(guildID)) return null;
        this.#autopaused.add(guildID);
        const player = this.container.erela.players.get(guildID);
        return this.container.client.setTimeout(guild => {
            if (guild.me.voice.channel && guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return null;
            if (player) player.destroy();
            return null;
        }, 30000, this.container.client.guilds.cache.get(guildID));
    }

};
