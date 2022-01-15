const { Command, CommandOptionsRunTypeEnum, Timestamp, util: { toTitleCase } } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

const symbols = {
    song: '🔂',
    queue: '🔁',
    none: '➡'
};

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['np'],
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Shows information about the current song playing in the server.'
        });
    }

    async messageRun(msg) {
        const { queue = [] } = await this.container.client.providers.default.get('music', msg.guild.id) || {};
        if (!queue.length || !msg.guild.me.voice.channel) throw `${this.container.client.constants.EMOTES.xmark}  ::  There is no music playing in this server!`;
        const { length } = queue[0].info;
        const { position } = msg.guild.player.state;
        const timestamp = new Timestamp(`${length >= 86400000 ? 'DD:' : ''}${length >= 3600000 ? 'HH:' : ''}mm:ss`);

        const progress = '░'.repeat(35).split('');
        const count = Math.ceil(((position / length)) * progress.length);
        progress.splice(0, count, '▓'.repeat(count));

        return msg.send({
            embed: new MessageEmbed()
                .setTitle(queue[0].info.title)
                .setURL(queue[0].info.uri)
                .setColor('RANDOM')
                .setAuthor(`🎶 Now Playing on ${msg.guild.name}`)
                .setFooter(`Requested by ${await msg.guild.members.fetch(queue[0].requester).then(mb => `${mb.displayName} (${mb.user.tag})`).catch(() => this.container.client.users.fetch(queue[0].requester).then(user => user.tag))}`) // eslint-disable-line max-len
                .setDescription(`by ${queue[0].info.author}\n\n\`${progress.join('')}\` ${queue[0].info.isStream ? 'N/A' : `${parseInt((position / length) * 100)}%`}`)
                .addField('Time', queue[0].info.isStream ? 'N/A - Online Stream' : `\`${timestamp.display(position)} / ${timestamp.display(length)}\``, true)
                .addField('Volume', `${this.container.client.lavacord.players.get(msg.guild.id).state.volume}%`, true)
                .addField('Repeat', `${symbols[msg.guild.settings.get('music.repeat')]} ${toTitleCase(msg.guild.settings.get('music.repeat'))}`, true)
                .setTimestamp()
        });
    }

};
