const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Timestamp } = require('@sapphire/time-utilities');
const { toTitleCase } = require('@sapphire/utilities');
const { MessageEmbed } = require('discord.js');

const symbols = {
    song: '🔂',
    queue: '🔁',
    none: '➡'
};

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['np'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Shows information about the current song playing in the server.'
        });
    }

    async messageRun(msg) {
        const { queue } = this.container.stores.get('gateways').get('musicGateway').get(msg.guild.id);
        if (!queue.length || !msg.guild.me.voice.channel) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`);
        const { length } = queue[0].info;
        const { position } = this.container.erela.players.get(msg.guild.id).state;
        const timestamp = new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`);

        const progress = '░'.repeat(35).split('');
        const count = Math.ceil(((position / length)) * progress.length);
        progress.splice(0, count, '▓'.repeat(count));

        const guildGateway = this.container.stores.get('gateways').get('guildGateway');
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setTitle(queue[0].info.title)
                .setURL(queue[0].info.uri)
                .setColor('RANDOM')
                .setAuthor({ name: `🎶 Now Playing on ${msg.guild.name}` })
                .setFooter({ text: `Requested by ${await msg.guild.members.fetch(queue[0].requester).then(mb => `${mb.displayName} (${mb.user.tag})`).catch(() => this.container.client.users.fetch(queue[0].requester).then(user => user.tag))}` }) // eslint-disable-line max-len
                .setDescription(`by ${queue[0].info.author}\n\n\`${progress.join('')}\` ${queue[0].info.isStream ? 'N/A' : `${parseInt((position / length) * 100)}%`}`)
                .addField('Time', queue[0].info.isStream ? 'N/A - Online Stream' : `\`${timestamp.display(position)} / ${timestamp.display(length)}\``, true)
                .addField('Volume', `${this.container.erela.players.get(msg.guild.id).state.volume}%`, true)
                .addField('Repeat', `${symbols[guildGateway.get(msg.guild.id, 'music.repeat')]} ${toTitleCase(guildGateway.get(msg.guild.id, 'music.repeat'))}`, true)
                .setTimestamp()]
        });
    }

};
