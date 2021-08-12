const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: ['text'],
            description: 'Resumes paused music in the server.'
        });
    }

    async run(msg) {
        if (!msg.guild.me.voice.channel) throw `${this.client.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
        if (!this.client.lavacord.players.get(msg.guild.id).paused) throw `${this.client.constants.EMOTES.xmark}  ::  Music is already playing! Pause it with \`${msg.guild.settings.get('prefix')}pause\``;
        this.client.lavacord.players.get(msg.guild.id).pause(false);
        return msg.send(`${this.client.constants.EMOTES.tick}  ::  Successfully resumed the music for this server.`);
    }

};
