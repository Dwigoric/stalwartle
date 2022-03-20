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
        const { queue, position, volume } = this.container.erela.players.get(msg.guild.id);
        if (!queue.current) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is no music playing in this server!`);
        const timestamp = new Timestamp(`${queue.current.duration >= 86400000 ? 'DD:' : ''}${queue.current.duration >= 3600000 ? 'HH:' : ''}mm:ss`);

        const progress = '░'.repeat(35).split('');
        const count = Math.ceil(((position / queue.current.duration)) * progress.length);
        progress.splice(0, count, '▓'.repeat(count));

        const { music: { repeat } } = this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id);
        return reply(msg, {
            embeds: [new MessageEmbed()
                .setTitle(queue.current.title)
                .setURL(queue.current.uri)
                .setColor('RANDOM')
                .setAuthor({ name: `🎶 Now Playing on ${msg.guild.name}` })
                .setFooter({ text: `Requested by ${await msg.guild.members.fetch(queue.current.requester, { cache: false }).then(mb => `${mb.displayName} (${mb.user.tag})`).catch(() => this.container.client.users.fetch(queue.current.requester, { cache: false }).then(user => user.tag))}` }) // eslint-disable-line max-len
                .setDescription(`by ${queue.current.author}\n\n\`${progress.join('')}\` ${queue.current.isStream ? 'N/A' : `${parseInt((position / queue.current.duration) * 100)}%`}`)
                .addField('Time', queue.current.isStream ? 'N/A - Online Stream' : `\`${timestamp.display(position)} / ${timestamp.display(queue.current.duration)}\``, true)
                .addField('Volume', `${volume}%`, true)
                .addField('Repeat', `${symbols[repeat]} ${toTitleCase(repeat)}`, true)
                .setTimestamp()]
        });
    }

};
