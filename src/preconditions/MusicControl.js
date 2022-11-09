const { Precondition } = require('@sapphire/framework');

module.exports = class MusicControlPrecondition extends Precondition {

    chatInputRun(interaction) {
        return this.runForAll(interaction);
    }

    messageRun(message) {
        return this.runForAll(message);
    }

    runForAll(medium) {
        if (!medium.guild) return this.ok();
        if (!medium.guild.me.voice.channel) return this.ok();
        if (!medium.guild.me.voice.channel.members.has(medium.member.id)) return this.error({ message: `You must be connected to ${medium.guild.me.voice.channel} to be able to control the music session.` }); // eslint-disable-line max-len
        return this.ok();
    }

};
