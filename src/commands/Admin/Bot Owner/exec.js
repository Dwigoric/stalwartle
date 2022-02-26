const { Command } = require('@sapphire/framework');
const { Stopwatch } = require('@sapphire/stopwatch');
const { codeBlock } = require('@sapphire/utilities');
const { reply } = require('@sapphire/plugin-editable-commands');

const { promisify } = require('util');
const { exec } = require('child_process');
const execute = promisify(exec);

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['execute'],
            cooldownDelay: 5000,
            description: 'Execute commands in the terminal, use with EXTREME CAUTION.',
            preconditions: ['OwnersOnly']
        });
    }

    async messageRun(msg, args) {
        let input = await args.restResult('string');
        if (!input.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please supply the command to be executed on the CLI.`);
        input = input.value;
        const stopwatch = new Stopwatch().start();
        const result = await execute(input, { timeout: 'timeout' in msg.flagArgs ? Number(msg.flagArgs.timeout) : 60000 })
            .catch(error => ({ error }));
        const results = [];
        if (result.stdout) results.push(`**\`OUTPUT\`**${codeBlock('', result.stdout)}`);
        if (result.stderr) results.push(`**\`STDERR\`**${codeBlock('', result.stderr)}`);
        if (result.error) results.push(`**\`ERROR\`**${codeBlock('xl', result.error)}`);

        return reply(msg, { content: results.concat(`⏱ ${stopwatch.stop()}`).join('\n') });
    }

};
