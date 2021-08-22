const { Command } = require('@sapphire/framework');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            runIn: ['text'],
            description: 'Makes me ignore channels or a channel category in the server.',
            extendedHelp: 'If you want to unignore channels or categories, simply reuse the command and give the channel you want to unignore.',
            usage: '[list] (ChannelOrCategory:channel)',
            usageDelim: ' ',
            subcommands: true
        });

        this.createCustomResolver('channel', (arg, possible, msg, [action]) => {
            if (action === 'list') return undefined;
            if (!arg) throw `${this.container.client.constants.EMOTES.xmark}  ::  Please provide the channel you want me to ignore.`;
            return this.container.client.arguments.get('channel').run(arg, possible, msg);
        });
    }

    async run(msg, [channel]) {
        if (channel.type === 'voice') throw `${this.container.client.constants.EMOTES.xmark}  ::  That is a voice channel... Commands cannot be input in a voice channel in the first place.`;
        if (channel.type === 'category') channel = msg.guild.channels.cache.filter(chan => chan.parentID === channel.id && chan.type === 'text');
        else channel = [channel];
        const ignored = msg.guild.settings.get('ignored');
        const added = [],
            removed = [];
        channel.forEach(chan => {
            if (ignored.includes(chan.id)) removed.push(chan);
            else added.push(chan);
            msg.guild.settings.update('ignored', chan.id, msg.guild);
        });
        return msg.send([
            `🔇 Ignored  ::  ${added.length ? added.join(', ') : 'None'}`,
            `🔈 Unignored  ::  ${removed.length ? removed.join(', ') : 'None'}`
        ].join('\n'));
    }

    async list(msg) {
        const ignored = msg.guild.settings.get('ignored');
        if (!ignored.length) throw 'This server currently has no ignored channels.';
        const channels = ignored.map(ign => {
            if (msg.guild.channels.cache.has(ign)) return msg.guild.channels.cache.get(ign);
            else msg.guild.settings.update('ignored', ign, msg.guild, { arrayAction: 'remove' });
            return null;
        });
        channels.forEach(chan => { if (!chan) channels.splice(channels.indexOf(chan), 1); });
        const isSingular = channels.length === 1;
        const ignoredChanCount = `There ${isSingular ? 'is' : 'are'} **${channels.length}** ignored channel${isSingular ? '' : 's'} in this server:`;
        return msg.send(`🔇  ::  ${ignoredChanCount}\n${channels.join(', ')}`);
    }

};
