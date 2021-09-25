const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            aliases: ['restart'],
            permissionLevel: 9,
            description: 'Restarts the bot, and then notifies in the same channel if the bot is up again.'
        });
    }

    async run(msg) {
        await this.container.client.gateways.client.update(this.container.client.user.id, { restart: { channel: msg.channel.id, timestamp: msg.createdTimestamp } });
        await msg.sendLocale('COMMAND_REBOOT').catch(err => this.container.client.emit('error', err));
        await this.container.client.destroy();
        await this.container.client.playerManager.destroy();
        process.exit();
    }

    async init() {
        const { channel, timestamp } = await this.container.client.settings.restart;
        if (!channel) return;
        (await this.container.client.channels.fetch(channel)).send({
            embed: new MessageEmbed()
                .setColor(0x40E0D0)
                .setTitle('Bot has successfully restarted!')
                .setThumbnail(this.container.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`**Creeping through Discord...**\nand doing some magic!\n\nCurrently running on **${await this.container.client.guildCount()}** guilds with **${await this.container.client.userCount()}** users.`) // eslint-disable-line max-len
                .setFooter(`Reboot duration: ${+`${`${Math.round(`${`${(Date.now() - timestamp) / 1000}e+2`}`)}e-2`}`}s`)
                .setTimestamp()
        });
        this.container.client.gateways.client.update(this.container.client.user.id, { restart: {
            channel: this.container.client.gateways.client.defaults.channel,
            timestamp: this.container.client.gateways.client.defaults.timestamp
        } });
    }

};
