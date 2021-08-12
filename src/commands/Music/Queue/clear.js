const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            permissionLevel: 5,
            description: 'Clears the music queue for the server, optionally those requested by a specified user.',
            usage: '[Requester:user]'
        });
    }

    async run(msg, [user]) {
        const { queue } = await this.client.providers.default.get('music', msg.guild.id);
        this.client.providers.default.update('music', msg.guild.id, { queue: (msg.guild.player && msg.guild.player.playing ? queue.slice(0, 1) : []).concat(user ? queue.filter((track, index) => index && track.requester !== user.id) : []) }); // eslint-disable-line max-len
        msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully cleared the music queue for this server${user ? ` of ${user.tag}'s requests` : ''}.`);
    }

};
