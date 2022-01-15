const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Pauses music playing in the voice channel.'
        });
    }

    async messageRun(msg) {
        if (!msg.guild.me.voice.channel) throw `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
        if (this.container.lavacord.players.get(msg.guild.id).paused) throw `${this.container.constants.EMOTES.xmark}  ::  Music is already paused! Resume it with \`${msg.guild.settings.get('prefix')}resume\``;
        this.container.lavacord.players.get(msg.guild.id).pause(true);
        return msg.send(`${this.container.constants.EMOTES.tick}  ::  Successfully paused the music for this server.`);
    }

};
