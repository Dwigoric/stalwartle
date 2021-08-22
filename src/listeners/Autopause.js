const { Listener, Events } = require('@sapphire/framework');

const autopaused = new Set();

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.VoiceStateUpdate });
    }

    async run(oldState, newState) {
        if (!this.container.client.lavacord) return null;
        if (!this.container.client.lavacord.players.get(newState.guild.id)) return null;
        if (!newState.guild.me.voice.channel) return this.container.client.lavacord.leave(newState.guild.id);
        if (oldState.channel && newState.channel && (oldState.channel.id === newState.channel.id || ![oldState.channel.id, newState.channel.id].includes(newState.guild.me.voice.channel))) return null;

        const channelMembers = newState.guild.me.voice.channel.members.filter(mb => !mb.user.bot);
        if (this.container.client.lavacord.players.get(newState.guild.id) && !this.container.client.lavacord.players.get(newState.guild.id).playing && !channelMembers.size) {
            clearTimeout(this.container.client.commands.get('play').timeouts.get(newState.guild.id));
            this.container.client.commands.get('play').timeouts.delete(newState.guild.id);
            return this.container.client.lavacord.leave(newState.guild.id);
        }
        if (newState.guild.me.voice.channel && channelMembers.size && this.autopaused.has(newState.guild.id)) {
            this.autopaused.delete(newState.guild.id);
            return this.container.client.lavacord.players.get(newState.guild.id).pause(false);
        }
        if (channelMembers.size) return null;
        const { queue } = await this.container.client.gateways.music.get(newState.guild.id);
        if (!queue[0].info.isStream) {
            this.autopaused.add(newState.guild.id);
            this.container.client.lavacord.players.get(newState.guild.id).pause(true);
        }
        if (this.container.client.gateways.guilds.get(newState.guild.id).donation >= 10) return null;
        return this.container.client.setTimeout(guild => {
            if (guild.me.voice.channel && guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return null;
            this.container.client.lavacord.leave(guild.id);
            if (queue[0].requester === this.container.client.user.id) this.container.client.gateways.music.update(newState.guild.id, { queue: this.container.client.gateways.music.defaults.queue });
            return null;
        }, 30000, newState.guild);
    }

    get autopaused() {
        return autopaused;
    }

};
