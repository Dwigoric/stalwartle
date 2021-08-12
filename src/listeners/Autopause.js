const { Listener, Events } = require('@sapphire/framework');

const autopaused = new Set();

module.exports = class extends Listener {

    constructor(...args) {
        super(...args, { event: Events.VoiceStateUpdate });
    }

    async run(oldState, newState) {
        if (!this.client.lavacord) return null;
        if (!newState.guild.player) return null;
        if (!newState.guild.me.voice.channel) return this.client.lavacord.leave(newState.guild.id);
        if (oldState.channel && newState.channel && (oldState.channel.id === newState.channel.id || ![oldState.channel.id, newState.channel.id].includes(newState.guild.me.voice.channel))) return null;

        const channelMembers = newState.guild.me.voice.channel.members.filter(mb => !mb.user.bot);
        if (newState.guild.player && !newState.guild.player.playing && !channelMembers.size) {
            clearTimeout(this.client.commands.get('play').timeouts.get(newState.guild.id));
            this.client.commands.get('play').timeouts.delete(newState.guild.id);
            return this.client.lavacord.leave(newState.guild.id);
        }
        if (newState.guild.me.voice.channel && channelMembers.size && this.autopaused.has(newState.guild.id)) {
            this.autopaused.delete(newState.guild.id);
            return newState.guild.player.pause(false);
        }
        if (channelMembers.size) return null;
        const { queue } = await this.client.providers.default.get('music', newState.guild.id);
        if (!queue[0].info.isStream) {
            this.autopaused.add(newState.guild.id);
            newState.guild.player.pause(true);
        }
        if (newState.guild.settings.get('donation') >= 10) return null;
        return this.client.setTimeout(guild => {
            if (guild.me.voice.channel && guild.me.voice.channel.members.filter(mb => !mb.user.bot).size) return null;
            this.client.lavacord.leave(guild.id);
            if (queue[0].requester === this.client.user.id) this.client.providers.default.update('music', newState.guild.id, { queue: [] });
            return null;
        }, 30000, newState.guild);
    }

    get autopaused() {
        return autopaused;
    }

};
