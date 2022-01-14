const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const { send } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            cooldownDelay: 5000,
            description: 'Replies to a bug report or a suggestion.',
            detailedDescription: 'To deny, just add the flag `--deny`. It will not send to the resulting channel.',
            flags: ['deny'],
            preconditions: ['DevsOnly'],
            requiredClientPermissions: ['EMBED_LINKS'],
            runIn: ['text']
        });
    }

    async messageRun(msg, args) {
        const reportChans = {
            [this.container.client.settings.bugs.reports]: this.container.client.settings.bugs.processed,
            [this.container.client.settings.suggestions.reports]: this.container.client.settings.suggestions.processed
        };

        let repUser = await args.pick('user');
        if (!repUser.success) return send(msg, `${this.container.client.constants.EMOTES.xmark}  ::  You must supply the user/reporter of the report.`);
        repUser = repUser.value;

        let repMsg = await args.pick('message');
        if (!repMsg.success) return send(msg, `${this.container.client.constants.EMOTES.xmark}  ::  You must supply the message ID or message link of the report.`);
        repMsg = repMsg.value;

        let repCom = await args.rest('string');
        if (!repUser.success) return send(msg, `${this.container.client.constants.EMOTES.xmark}  ::  You must supply comments on the report.`);
        repCom = repCom.value;

        if (!repMsg.author.equals(this.container.client.user)) return null;
        if (!Object.keys(reportChans).includes(msg.channel.id)) return send(msg, `${this.container.client.constants.EMOTES.xmark}  ::  This command can only be run in bug and suggestions channels.`);
        const embed = new MessageEmbed()
            .setColor('RANDOM')
            .setAuthor(repUser.tag, repUser.displayAvatarURL({ dynamic: true }))
            .addField('Submission', repMsg.content)
            .addField("High Lord's Comments", repCom.join(' '))
            .setTimestamp();
        const attachments = repMsg.attachments.size ? repMsg.attachments.filter(atch => {
            const filename = atch.name;
            return /.(png|gif|jpe?g|webp)/i.test(filename.slice(-1 * (filename.length - filename.lastIndexOf('.'))));
        }) : null;
        if (attachments && attachments.size) embed.setImage(attachments.first().url);
        if (!msg.flagArgs.deny) this.container.client.channels.cache.get(reportChans[msg.channel.id]).send(embed).catch();
        msg.delete();
        await msg.channel.send(`${this.container.client.constants.EMOTES.tick}  ::  Report sent to **${repUser.tag}**.`).then(sent => setTimeout(() => sent.delete(), 5000));
        repMsg.delete().catch(() => null);
        return repUser.send('Your submission has been acknowledged by a high lord!', { embed }).catch(() => null);
    }

};
