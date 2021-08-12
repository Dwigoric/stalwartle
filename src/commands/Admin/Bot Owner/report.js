const { Command } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 9,
            runIn: ['text'],
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Replies to a bug report or a suggestion.',
            extendedHelp: 'To deny, just add the flag `--deny`. It will not send to the resulting channel.',
            usage: '<User:user> <Message:message> <Comment:string> [...]',
            usageDelim: ' '
        });
    }

    async run(msg, [repUser, repMsg, ...repCom]) {
        const reportChans = {
            [this.client.settings.get('bugs.reports')]: this.client.settings.get('bugs.processed'),
            [this.client.settings.get('suggestions.reports')]: this.client.settings.get('suggestions.processed')
        };
        if (!repMsg.author.equals(this.client.user)) return null;
        if (!Object.keys(reportChans).includes(msg.channel.id)) throw `${this.client.constants.EMOTES.xmark}  ::  This command can only be run in bug and suggestions channels.`;
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
        if (!msg.flagArgs.deny) this.client.channels.cache.get(reportChans[msg.channel.id]).send(embed).catch();
        msg.delete();
        msg.send(`${this.client.constants.EMOTES.tick}  ::  Report sent to **${repUser.tag}**.`).then(sent => {
            setTimeout(() => {
                sent.delete();
            }, 5000);
        });
        repMsg.delete().catch(() => null);
        return repUser.send('Your submission has been acknowledged by a high lord!', { embed }).catch(() => null);
    }

};
