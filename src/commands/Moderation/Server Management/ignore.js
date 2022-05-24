const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            preconditions: ['ModsOnly'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Makes me ignore channels or a channel category in the server.',
            detailedDescription: 'If you want to unignore channels or categories, simply reuse the command and give the channel you want to unignore.',
            subCommands: ['list', { input: 'default', default: true }]
        });
        this.usage = '[list]|(ChannelOrCategory:channel)';
    }

    async default(msg, args) {
        let channel = await args.pickResult('guildChannel');
        if (!channel.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the server channel by mentioning it or giving its ID.`);
        channel = channel.value;

        if (!['GUILD_TEXT', 'GUILD_CATEGORY'].includes(channel.type)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Only channel categories and text channels are supported.`);
        channel = channel.type === 'GUILD_CATEGORY' ? msg.guild.channels.cache.filter(chan => chan.parentID === channel.id && chan.type === 'GUILD_TEXT') : [channel];
        const { ignored } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        const added = [],
            removed = [];
        channel.forEach(chan => {
            if (ignored.includes(chan.id)) {
                removed.push(this.container.client.channels.cache.get(...ignored.splice(ignored.indexOf(chan.id), 1)) || chan.id);
            } else {
                ignored.push(chan.id);
                added.push(chan);
            }
        });
        await this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, { ignored });
        return reply(msg, [
            `🔇 Ignored  ::  ${added.length ? added.join(', ') : 'None'}`,
            `🔈 Unignored  ::  ${removed.length ? removed.join(', ') : 'None'}`
        ].join('\n'));
    }

    async list(msg) {
        const ignored = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'ignored');
        if (!ignored.length) return reply(msg, 'This server currently has no ignored channels.');
        let channels = ignored.map(ign => {
            if (msg.guild.channels.cache.has(ign)) return msg.guild.channels.cache.get(ign);
            else ignored.splice(ignored.indexOf(ign), 1);
            return null;
        });
        await this.container.stores.get('gateways').get('guildGateway').update(msg.guild.id, { ignored });
        channels = channels.filter(chan => chan !== null);
        const isSingular = channels.length === 1;
        const ignoredChanCount = `There ${isSingular ? 'is' : 'are'} **${channels.length}** ignored channel${isSingular ? '' : 's'} in this server:`;
        return reply(msg, `🔇  ::  ${ignoredChanCount}\n${channels.join(', ')}`);
    }

};
