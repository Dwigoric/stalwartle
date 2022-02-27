const { Precondition } = require('@sapphire/framework');

module.exports = class MusicControlPrecondition extends Precondition {

    async run(msg, command) {
        if (!msg.guild) return this.ok();
        if (command.category !== 'Music' || (command.category === 'Music' && command.subCategory !== 'Control')) return this.ok();
        if (!msg.guild.me.voice.channel) return this.ok();
        if (!msg.guild.me.voice.channel.members.has(msg.member.id)) return this.error({ message: `${this.container.constants.EMOTES.xmark}  ::  You must be connected to #**${msg.guild.me.voice.channel.name}** to be able to control the music session.` }); // eslint-disable-line max-len
        return this.ok();
    }

};
