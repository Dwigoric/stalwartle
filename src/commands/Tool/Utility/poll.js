const { Command, CommandOptionsRunTypeEnum, container } = require('@sapphire/framework');
const { reply } = container;
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            requiredClientPermissions: ['EMBED_LINKS'],
            description: 'Creates a poll in the current channel or in the channel you specify.',
            detailedDescription: 'The first you give is the question, then separated by `|`, you give the choices. If you do not want the default reactions, use the flag `--no-default`',
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            flags: ['no-default']
        });
        this.usage = '[Channel:channel] <Question:string> | <Choices:string> | [...]';
    }

    async messageRun(msg, args) {
        const chan = await args.pick('guildTextChannel').catch(() => msg.channel);
        let choices = await args.restResult('string');
        if (!choices.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give the question and the choices of the poll.`);
        choices = choices.value.split(' | ');
        const question = choices.splice(0, 1)[0].trim();

        if (!chan.permissionsFor(this.container.client.user).has('SEND_MESSAGES')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! I cannot send messages in that channel.`);
        // eslint-disable-next-line max-len
        if (!chan.permissionsFor(this.container.client.user).has(['EMBED_LINKS', 'ADD_REACTIONS'])) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please allow me to send embeds and/or give reactions in that channel.`);
        if (!chan.permissionsFor(msg.author).has('VIEW_CHANNEL', true)) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  It seems you cannot send messages in that channel...`); // eslint-disable-line max-len
        if (choices.length < 2) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Your poll must have at least two (2) choices!`);
        if (choices.length > 10) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Sorry! You can only have a maximum of ten (10) choices.`);
        if (question.length > 256) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You can only have a maximum of 256 characters in your question.`);
        if (chan !== msg.channel) reply(msg, `${this.container.constants.EMOTES.tick}  ::  Poll created!`);

        choices = choices.splice(0, 10);
        const emojis = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'].splice(0, choices.length);
        choices = choices.map((choice, index) => `${emojis[index]} ${choice.trim()}`);
        if (!args.getFlags('no-default')) {
            emojis.push('❓', '❌', '💯');
            choices.push('❓ What?', '❌ None of the choices', '💯 All of the choices');
        }

        const poll = await chan.send({
            embeds: [new MessageEmbed()
                .setColor(0x40E0D0)
                .setAuthor({ name: question, iconURL: msg.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(choices.join('\n'))
                .setFooter({ text: `Poll started by ${msg.author.tag}` })
                .setTimestamp()]
        });
        let i = 0;
        const loop = () => {
            setTimeout(() => {
                poll.react(emojis[i]);
                if (++i < emojis.length) loop();
            }, 1000);
        };
        loop();

        return poll;
    }

};
