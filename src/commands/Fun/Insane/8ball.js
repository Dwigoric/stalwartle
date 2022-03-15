const { Command } = require('@sapphire/framework');
const { Message } = require('discord.js');
const { reply } = require('@sapphire/plugin-editable-commands');

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['8b', 'eightballball'],
            description: 'Magic 8-Ball, does exactly what the toy does.'
        });
        this.usage = '<Message:message|Question:string>';
    }

    async messageRun(msg, args) {
        let question = await args.pick('message').catch(() => args.rest('string')).catch(() => null);
        if (question === null) return reply(msg, `${this.containter.constants.EMOTES.xmark}  ::  Please provide the message (ID/link) or the question to be answered.`);

        if (question instanceof Message) question = question.content;
        return reply(msg, `❓  ::  ${question}\n🎱  ::  ${answers[Math.floor(Math.random() * answers.length)]}`, { disableMentions: 'everyone' });
    }

};

const answers = [
    'Maybe.',
    'Certainly not.',
    'I hope so.',
    'Not in your wildest dreams.',
    'There is a good chance.',
    'Quite likely.',
    'I think so.',
    'I hope not.',
    'I hope so.',
    'Never!',
    'Fuhgeddaboudit.',
    'Ahaha! Really?!?',
    'Pfft.',
    'Sorry, bucko.',
    'Hell, yes.',
    'Hell to the no.',
    'The future is bleak.',
    'The future is uncertain.',
    'I would rather not say.',
    'Who cares?',
    'Possibly.',
    'Never, ever, ever.',
    'There is a small chance.',
    'Yes!'
];
