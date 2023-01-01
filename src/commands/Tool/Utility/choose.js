const { Command, container } = require('@sapphire/framework');
const { reply } = container;

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['pick'],
            description: 'Chooses between two or more choices. Use ` | ` (two spaces, mind you!) to separate each choice.'
        });
        this.usage = '<Choices:string> | [...]';
    }

    async messageRun(msg, args) {
        let choices = await args.restResult('string');
        if (!choices.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please give me something to choose from!`);
        choices = choices.value.split(' | ');

        if (choices.length < 2) return reply(msg, '🤔  ::  I don\'t think there\'s a sense in having less than two choices...');
        return reply(msg, `🤔  ::  I choose... **${choices[Math.floor(Math.random() * choices.length)].trim()}**!`);
    }

};
