const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 5,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Resumes paused music in the server.'
        });
    }

    async messageRun(msg) {
        if (!msg.guild.me.voice.channel) throw `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
        if (!this.container.lavacord.players.get(msg.guild.id).paused) throw `${this.container.constants.EMOTES.xmark}  ::  Music is already playing! Pause it with \`${msg.guild.settings.get('prefix')}pause\``;
        this.container.lavacord.players.get(msg.guild.id).pause(false);
        return msg.send(`${this.container.constants.EMOTES.tick}  ::  Successfully resumed the music for this server.`);
    }

};
