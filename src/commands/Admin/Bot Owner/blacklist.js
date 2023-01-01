const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const { codeBlock } = require('@sapphire/utilities');
const { User } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['OwnersOnly'],
            description: 'Blacklists or un-blacklists users and guilds from the bot.'
        });
        this.usage = '<User:user|Guild:guild|guild:str> [...]';
        this.guarded = true;
        this.terms = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];
    }

    async messageRun(message, args) {
        let usersAndGuilds = await args.pickResult('user');
        if (!usersAndGuilds.success) usersAndGuilds = await args.restResult('string');
        if (!usersAndGuilds.success) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Please give the user or guild ID to blacklist.`);
        usersAndGuilds = [usersAndGuilds.value];

        const changes = [[], [], [], []];
        const { userBlacklist, guildBlacklist } = this.container.client.settings;

        for (const userOrGuild of new Set(usersAndGuilds)) {
            const type = userOrGuild instanceof User ? 'user' : 'guild';
            const usedArray = type === 'user' ? userBlacklist : guildBlacklist;
            if (this.container.client.settings[`${type}Blacklist`].includes(userOrGuild.id || userOrGuild)) {
                changes[this.terms.indexOf(`${type}sRemoved`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
                usedArray.splice(usedArray.indexOf(userOrGuild.id || userOrGuild), 1);
            } else {
                changes[this.terms.indexOf(`${type}sAdded`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
                usedArray.push(userOrGuild.id || userOrGuild);
            }
        }

        await this.container.stores.get('gateways').get('clientGateway').update(this.container.client.user.id, { userBlacklist, guildBlacklist });

        return reply(message, ((usersAdded, usersRemoved, guildsAdded, guildsRemoved) => [
            usersAdded.length ? `**Users Added**\n${codeBlock('', usersAdded.join(', '))}` : '',
            usersRemoved.length ? `**Users Removed**\n${codeBlock('', usersRemoved.join(', '))}` : '',
            guildsAdded.length ? `**Guilds Added**\n${codeBlock('', guildsAdded.join(', '))}` : '',
            guildsRemoved.length ? `**Guilds Removed**\n${codeBlock('', guildsRemoved.join(', '))}` : ''
        ].filter(val => val !== '').join('\n'))(...changes));
    }

};
