const { Precondition } = require('@sapphire/framework');

module.exports = class extends Precondition {

    async run(msg, cmd) {
        if (!msg.guild) return;
        if (cmd.name === 'ignore') return;
        if (msg.guild.settings.get('ignored').includes(msg.channel.id)) throw '🔇  ::  This channel is included in this server\'s ignored channels.';
    }

};
