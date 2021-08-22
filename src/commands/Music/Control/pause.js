const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: ['text'],
            description: 'Pauses music playing in the voice channel.'
        });
    }

    async run(msg) {
        if (!msg.guild.me.voice.channel) throw `${this.container.client.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
        if (this.container.client.lavacord.players.get(msg.guild.id).paused) throw `${this.container.client.constants.EMOTES.xmark}  ::  Music is already paused! Resume it with \`${msg.guild.settings.get('prefix')}resume\``;
        this.container.client.lavacord.players.get(msg.guild.id).pause(true);
        return msg.send(`${this.container.client.constants.EMOTES.tick}  ::  Successfully paused the music for this server.`);
    }

};
