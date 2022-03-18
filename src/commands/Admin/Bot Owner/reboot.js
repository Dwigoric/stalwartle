const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['restart'],
            description: 'Restarts the bot, and then notifies in the same channel if the bot is up again.',
            preconditions: ['DevsOnly']
        });
    }

    async messageRun(msg) {
        await this.container.stores.get('gateways').get('clientGateway').update(this.container.client.user.id, { restart: { channel: msg.channel.id, timestamp: msg.createdTimestamp } });
        await msg.reply('<a:loading:430269209415516160>  ::  Bot is restarting... I will message you in this channel once I\'ve woken up again.').catch(err => this.container.client.emit('error', err));
        await this.container.client.destroy();
        await this.container.erela.nodes.forEach(node => node.destroy());
        process.exit();
    }

    async init() {
        const { channel, timestamp } = await this.container.client.settings.restart;
        if (!channel) return;
        (await this.container.client.channels.fetch(channel)).send({
            embeds: [new MessageEmbed()
                .setColor(0x40E0D0)
                .setTitle('Bot has successfully restarted!')
                .setThumbnail(this.container.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**Creeping through Discord...**\nand doing some magic!\n\nCurrently running on **${await this.container.client.guildCount()}** guilds with **${await this.container.client.userCount()}** users.`) // eslint-disable-line max-len
                .setFooter({ text: `Reboot duration: ${+`${`${Math.round(`${`${(Date.now() - timestamp) / 1000}e+2`}`)}e-2`}`}s` })
                .setTimestamp()]
        });
        ['restart.channel', 'restart.timestamp'].forEach(path => this.container.stores.get('gateways').get('clientGateway').reset(this.container.client.id, path));
    }

};
