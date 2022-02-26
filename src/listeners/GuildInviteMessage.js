const { Listener, Events } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Listener {

    constructor(context, options) {
        super(context, { ...options, event: Events.GuildCreate });
    }

    async run(guild) {
        const message = new MessageEmbed()
            .setColor('#C62A29')
            .setAuthor({ name: 'Thank you for having me!', iconURL: await guild.members.fetch(guild.ownerID).then(owner => owner.user.displayAvatarURL({ dynamic: true })) })
            .setTitle(guild.name)
            .setFooter({ text: `${this.container.client.user.username} Added!`, iconURL: this.container.client.user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
            .setTimestamp()
            .setDescription([
                `Hey there ${guild.owner}! Thank you for having me in **${guild.name}**. It is an honor to serve you.`,
                `\nTo get started, please use \`${this.container.stores.get('gateways').get('guildGateway').get(guild.id).prefix}help\` here or on any text channel. You will be given a list of commands.`,
                `Please feel free to look at the command list. If you want me to serve more Discord users, just use the \`${this.container.stores.get('gateways').get('guildGateway').get(guild.id).prefix}invite\` command!`,
                '\nI can play music, moderate users, search lyrics, search Steam, search a lot more other stuff, and more!',
                `Most users use the music feature. Run \`${this.container.stores.get('gateways').get('guildGateway').get(guild.id).prefix}help music\` and \`${this.container.stores.get('gateways').get('guildGateway').get(guild.id).prefix}help play\` for more information!`, // eslint-disable-line max-len
                `\nBy **${this.container.client.application.owner.members.map(tm => tm.user.tag).join(', ')}**, from 🇵🇭 with ❤`
            ].join('\n'));
        const postableChannel = guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT' && ch.postable && ch.permissionsFor(guild.me).has('EMBED_LINKS')).first();
        if (!postableChannel) return guild.owner.user.sendEmbed(message).catch(() => null);
        return postableChannel.sendEmbed(message);
    }

};
