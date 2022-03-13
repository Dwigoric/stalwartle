const { Command, CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'Change/update reason for a specific modlog given its ID.'
        });
    }

    async messageRun(msg, args) {
        let modlogID = await args.pickResult('integer');
        if (!modlogID.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the modlog ID.`);
        modlogID = modlogID.value;
        let reason = await args.restResult('string');
        if (!reason.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please provide the new reason the modlog entry.`);
        reason = reason.value;

        const { modlogs } = await this.container.stores.get('gateways').get('modlogGateway').get(msg.guild.id);
        const modlog = modlogs[modlogID - 1];
        if (!modlog) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You provided an invalid modlog ID.`);
        modlog.reason = reason;
        modlogs.splice(Number(modlog.id) - 1, 1, modlog);
        this.container.stores.get('gateways').get('modlogGateway').update(msg.guild.id, { modlogs });

        if (!modlog.message) return reply(msg, `⚠  ::  I've updated the modlog in \`${this.container.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`, however the one sent in the modlog channel is not edited.`);
        const channel = msg.guild.channels.cache.get(this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, `modlogs.${modlog.type}`));
        let message;
        if (channel) message = await channel.messages.fetch(modlog.message).catch(() => null);
        if (message === null) return reply(msg, `⚠  ::  I've updated the modlog in \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}modlogs\`, however either the message has been deleted or the modlog message is not in ${channel}.`); // eslint-disable-line max-len
        const embed = message.embeds[0];
        const index = embed.fields.findIndex(field => field.name === 'Reason');
        embed.fields.splice(index >= 0 ? index : 2, index >= 0 ? 1 : 0, { inline: true, name: 'Reason', value: reason });
        message.edit({ embeds: [embed] });
        return reply(msg, `${this.container.constants.EMOTES.tick}  ::  Successfully updated modlog #\`${modlog.id}\`'s reason.`);
    }

};
