const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { codeBlock } = require('@sapphire/utilities');
const { User } = require('discord.js');
const { promisify } = require('util');

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

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('The user to blacklist.'))
                .addStringOption(option =>
                    option
                        .setName('server')
                        .setDescription('The ID of the server to blacklist.'))
        , {
            guildIds: [this.container.client.options.devServer],
            idHints: ['1014174483562647632']
        });
    }

    async chatInputRun(interaction) {
        const user = await promisify(interaction.options.getUser)('user', true).catch(() => null);
        const guild = await promisify(interaction.options.getString)('server', true).catch(() => null);

        if (user === null && guild === null) return interaction.reply({ content: `${this.container.constants.EMOTES.xmark}  ::  Please give the user or guild ID to blacklist.`, ephemeral: true });

        const { userBlacklist, guildBlacklist } = this.container.client.settings;
        if (user !== null) userBlacklist.push(user.id);
        if (guild !== null) guildBlacklist.push(guild);

        await this.container.stores.get('gateways').get('clientGateway').update(this.container.client.user.id, { userBlacklist, guildBlacklist });

        return interaction.reply({
            content: `${this.container.constants.EMOTES.check}  ::  Successfully blacklisted ${user ? 'user' : 'guild'} ${user ? `**${user.tag}**` : guild}${guild && user ? ` and guild **${guild}**` : ''}.`,
            ephemeral: true
        });
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
