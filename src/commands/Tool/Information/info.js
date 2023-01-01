const { Command, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed, version } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['bot', 'bi', 'details', 'what'],
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Provides some information about Stalwartle.'
        });
        this.guarded = true;
    }

    async messageRun(msg) {
        const owners = await Promise.all(this.container.client.options.developers.map(owner => this.container.client.users.fetch(owner).then(own => own.tag)));

        reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor({ name: `Information about ${this.container.client.user.username}`, iconURL: this.container.client.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(this.container.client.user.displayAvatarURL({ dynamic: true }))
                .addField('Owners', owners.join(', '), true)
                .addField('Support Server', `${this.container.client.guilds.cache.get('502895390807293963').name}\n(<https://discord.gg/KDWGvV8>)`, true)
                .addField('Discord.js Version', `v${version}`, true)
                .addField('Node.js Version', process.version, true)
                .addField('Bot Creator', (await this.container.client.users.fetch(this.container.client.options.ownerID)).tag, true)
                .addField('Created', `<t:${(this.container.client.user.createdAt / 1000).toFixed()}:f> (<t:${(this.container.client.user.createdAt / 1000).toFixed()}:R>)`)
                .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()]
        });
    }

};
