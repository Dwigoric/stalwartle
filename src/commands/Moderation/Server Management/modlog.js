const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { LazyPaginatedMessage, MessagePrompter } = require('@sapphire/discord.js-utilities');
const { reply } = require('@sapphire/plugin-editable-commands');
const { toTitleCase, chunk } = require('@sapphire/utilities');
const { MessageEmbed, Util: { escapeMarkdown } } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            aliases: ['modlogs', 'log', 'logs'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Gives the modlogs for a certain person or the server, or the details of a specific case number.',
            detailedDescription: [
                'If you want to get the modlogs for the server and not for a user, simple do not provide a user.',
                'If you want to reset the modlogs (not the channels), use the `reset` subcommand.',
                'If you want to get the details of a specific case number, simply run `s.modlog <case number here>`.',
                'To get the modlogs of a certain type, you can use the `--type` flag, e.g. `--type=warn`, `--type=kick`, `ban`, etc.'
            ].join('\n'),
            options: ['type'],
            subCommands: ['reset', { input: 'default', default: true }]
        });
        this.usage = '[reset|User:user|CaseNumber:integer]';
    }

    async default(msg, args) {
        let user = await args.pickResult('integer');
        if (!user.success) user = await args.pickResult('user');
        user = user.success ? user.value : null;

        const { timezone } = this.container.stores.get('gateways').get('userGateway').get(msg.author.id);
        const { modlogs } = this.container.stores.get('gateways').get('modlogGateway').get(msg.guild.id);
        let list = modlogs.sort((a, b) => parseInt(a.id) - parseInt(b.id));

        if (typeof user === 'number') {
            const modlog = list[user - 1];
            if (!modlog) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Whoops! Seems like Case #${user} doesn't exist on this server... yet.`);
            const _user = await this.container.client.users.fetch(modlog.user).catch(() => null);
            const moderator = await this.container.client.users.fetch(modlog.moderator).catch(() => null);
            return reply(msg, {
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle(`${this.container.constants.EMOTES.blobban} Case #${modlog.id} | ${msg.guild.name}`)
                    .setDescription([
                        `Type: ${toTitleCase(modlog.type)}`,
                        `Moderator: ${moderator} (\`${modlog.moderator}\`)`,
                        `User: ${_user} (\`${modlog.user}\`)`,
                        `Date: ${moment(modlog.timestamp).tz(timezone).format('dddd, LL | LTS z')} (${moment(modlog.timestamp).fromNow()})`,
                        `Reason: ${modlog.reason || 'Not specified.'}`
                    ].join('\n'))
                    .setTimestamp(new Date(modlog.timestamp))]
            });
        }

        if (args.getOption('type') && this.container.client.commands.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').keyArray().includes(args.getOption('type'))) list = list.filter(ml => ml.type === args.getOption('type')); // eslint-disable-line max-len
        if (user) list = list.filter(ml => ml.user === user.id);
        if (!list.length) return reply(msg, `${this.container.constants.EMOTES.blobstop}  ::  Whoops! It seems that ${user ? user.tag : msg.guild.name} has no record${user ? ' on this server' : ''} yet.`);
        const message = await msg.reply(`${this.container.constants.EMOTES.loading}  ::  Loading moderation logs...`);
        const display = new LazyPaginatedMessage({
            template: {
                content: `${this.container.constants.EMOTES.tick}  ::  Moderation logs loaded!`,
                embeds: [new MessageEmbed()
                    .setColor('RANDOM')
                    .setTitle(`${this.container.constants.EMOTES.blobban} ${list.length} ${args.getOption('type') && this.container.client.commands.filter(cmd => cmd.category === 'Moderation' && cmd.subCategory === 'Action').keyArray().includes(args.getOption('type')) ? toTitleCase(args.getOption('type')) : 'Modlog'}${list.length === 1 ? '' : 's'} for ${user ? `${user.bot ? 'bot' : 'user'} ${user.tag}` : msg.guild.name}`)] // eslint-disable-line max-len
            }
        });

        await Promise.all(chunk(list, 5).map(modlog5 => Promise.all(modlog5.map(async modlog => {
            const _user = await this.container.client.users.fetch(modlog.user).catch(() => null);
            const moderator = await this.container.client.users.fetch(modlog.moderator).catch(() => null);
            return [
                `__**Case #${modlog.id}**__`,
                `Type: ${toTitleCase(modlog.type)}`,
                `Moderator: ${moderator || 'Could not get user'} (\`${modlog.moderator}\`)`,
                `User: ${_user || 'Could not get user'} (\`${modlog.user}\`)`,
                `Date: ${moment(modlog.timestamp).tz(timezone).format('dddd, LL | LTS z')} (${moment(modlog.timestamp).fromNow()})`,
                `Reason: ${modlog.reason ? escapeMarkdown(modlog.reason) : 'Not specified.'}`
            ].join('\n');
        })))).then(logs => logs.forEach(modlog5 => display.addPageEmbed(template => template.setDescription(modlog5.join('\n\n')))));

        return display.run(message, msg.author).catch(err => this.container.logger.error(err));
    }

    async reset(msg) {
        const handler = new MessagePrompter('⚠ Are you sure you want to reset **all** modlogs?', 'confirm');
        const prompt = await handler.run(msg.channel, msg.author).catch(() => null);
        handler.strategy.appliedMessage.delete();

        if (prompt) {
            await this.container.stores.get('gateways').get('modlogGateway').reset(msg.guild.id, 'modlogs');
            return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully reset the modlogs of **${msg.guild.name}**.`);
        }

        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Alright! You don't want to reset your modlogs.`);
    }

};
