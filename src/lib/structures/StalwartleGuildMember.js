const { Structures } = require('discord.js');

module.exports = Structures.extend('GuildMember', GuildMember => {
    class StalwartleGuildMember extends GuildMember {

        constructor(...args) {
            super(...args);
            this.actions = [];
            this.messages = [];
        }

    }
    return StalwartleGuildMember;
});
