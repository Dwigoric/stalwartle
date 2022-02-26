const { Command } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { MessageEmbed, version } = require('discord.js');
const moment = require('moment-timezone');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['bot', 'bi', 'details', 'what'],
            guarded: true,
            requiredPermissions: ['EMBED_LINKS'],
            description: language => language.get('COMMAND_INFO_DESCRIPTION')
        });
    }

    async messageRun(msg) {
        const timezone = msg.author.settings.get('timezone');
        const owners = await Promise.all(require('../../../config').config.owners.map(owner => this.container.client.users.fetch(owner).then(own => own.tag)));

        reply(msg, {
            embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor({ name: `Information about ${this.container.client.user.username}`, iconURL: this.container.client.user.displayAvatarURL({ dynamic: true }) })
                .setThumbnail(this.container.client.user.displayAvatarURL({ dynamic: true }))
                .addField('Owners', owners, true)
                .addField('Support Server', `${this.container.client.guilds.cache.get('502895390807293963').name}\n(<https://discord.gg/KDWGvV8>)`, true)
                .addField('Discord.js Version', `v${version}`, true)
                .addField('Node.js Version', process.version, true)
                .addField('Bot Creator', this.container.client.application.owner.tag, true)
                .addField('Created', `${moment(this.container.client.user.createdAt).tz(timezone).format('dddd, LL | LTS z')}\n>> ${moment(this.container.client.user.createdAt).fromNow()}`)
                .setFooter({ text: `Information requested by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()]
        });
    }

};
