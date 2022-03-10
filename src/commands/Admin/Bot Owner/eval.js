// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
const { Command } = require('@sapphire/framework');
const { codeBlock, isThenable } = require('@sapphire/utilities');
const { Stopwatch } = require('@sapphire/stopwatch');
const { Type } = require('@sapphire/type');
const { MessagePrompter } = require('@sapphire/discord.js-utilities');
const { reply } = require('@sapphire/plugin-editable-commands');

const { inspect, promisify } = require('util');
const fetch = require('node-fetch');

const sleep = promisify(setTimeout);

module.exports = class extends Command {

    constructor(context, options) {
        super(context, {
            ...options,
            aliases: ['ev'],
            cooldownDelay: 5000,
            cooldownLimit: 3,
            description: 'Evaluates arbitrary JavaScript. Reserved for bot owner.',
            detailedDescription: [
                'The eval command evaluates code as-in, any error thrown from it will be handled.',
                'It also uses the flags feature. Write --silent, --depth=number or --async to customize the output.',
                'The --silent flag will make it output nothing.',
                "The --depth flag accepts a number, for example, --depth=2, to customize util.inspect's depth.",
                'The --async flag will wrap the code into an async function where you can enjoy the use of await, however, if you want to return something, you will need the return keyword.',
                'The --showHidden flag will enable the showHidden option in util.inspect.',
                'If the output is too large, it\'ll send the output as a file, or in the console if the bot does not have the ATTACH_FILES permission.'
            ].join('\n'),
            flags: ['async', 'json', 'log', 'no-timeout', 'showHidden', 'silent'],
            options: ['depth', 'lang', 'language', 'output', 'output-to', 'wait'],
            preconditions: ['DevsOnly']
        });

        this.timeout = 30000;
    }

    async messageRun(msg, args) {
        let code = await args.restResult('string');
        if (!code.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No code was supplied to be evaluated.`);
        code = code.value;
        const flagTime = args.getFlags('no-timeout') ? Number(args.getOption('wait')) || this.timeout : Infinity;
        const language = args.getOption('lang') || args.getOption('language') || (args.getFlags('json') ? 'json' : 'js');
        const { success, result, time, type } = await this.timedEval(args, code, flagTime);

        if (args.getFlags('silent')) {
            if (!success && result && result.stack) this.container.client.emit('error', result.stack);
            return null;
        }

        const footer = codeBlock('ts', type);
        const sendAs = args.getOption('output') || args.getOption('output-to') || (args.getFlags('log') ? 'log' : null);
        return this.handleMessage(msg, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language });
    }

    async handleMessage(msg, options, { success, result, time, footer, language }) {
        switch (options.sendAs) {
            case 'file': {
                if (msg.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) {
                    return reply(msg, {
                        files: [{ name: 'output.txt', attachment: Buffer.from(result) }],
                        content: `Sent the result as a file.\n**Type**:${footer}\n${time}`
                    });
                }
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, { success, result, time, footer, language });
            }
            case 'haste':
            case 'hastebin': {
                if (!options.url) options.url = await this.getHaste(result, language).catch(() => null);
                if (options.url) return reply(msg, { content: `Sent the result to hastebin: <${options.url}>\n**Type**:${footer}\n${time}` });
                options.hastebinUnavailable = true;
                await this.getTypeOutput(msg, options);
                return this.handleMessage(msg, options, { success, result, time, footer, language });
            }
            case 'console':
            case 'log': {
                this.container.logger.debug(result);
                return reply(msg, { content: `Sent the result to console.\n**Type**:${footer}\n${time}` });
            }
            case 'none':
                return null;
            default: {
                if (result.length > 2000) {
                    await this.getTypeOutput(msg, options);
                    return this.handleMessage(msg, options, { success, result, time, footer, language });
                }
                return reply(msg, { content: `**${success ? 'Output' : 'Error'}**:${codeBlock(success ? language : 'xl', result)}\n**Type**:${footer}\n${time}` });
            }
        }
    }

    async getTypeOutput(msg, options) {
        const _options = ['log'];
        if (msg.channel.permissionsFor(this.container.client.user).has(['SEND_FILES', 'ATTACH_FILES'])) _options.push('file');
        if (!options.hastebinUnavailable) _options.push('hastebin');
        const handler = new MessagePrompter(`Choose one of the following options: ${_options.join(', ')}`, 'message');
        let _choice;
        do {
            if (handler.strategy.appliedMessage) handler.strategy.appliedMessage.delete();
            _choice = await handler.run(msg.channel, msg.author).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none'].includes(_choice.content));
        handler.strategy.appliedMessage.delete();
        options.sendAs = _choice.content;
    }

    timedEval(args, code, flagTime) {
        if (flagTime === Infinity || flagTime === 0) return this.eval(args, code);
        return Promise.race([
            sleep(flagTime).then(() => ({
                success: false,
                result: `TIMEOUT: Took longer than ${flagTime / 1000} seconds.`,
                time: '⏱ ...',
                type: 'EvalTimeoutError'
            })),
            this.eval(args, code)
        ]);
    }

    // Eval the input
    async eval(args, code) {
        const stopwatch = new Stopwatch();
        code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
        let success, syncTime, asyncTime, result;
        let thenable = false;
        let type;
        try {
            if (args.getFlags('async')) code = `(async () => {\n${code}\n})();`;
            result = eval(code);
            syncTime = stopwatch.toString();
            type = new Type(result);
            if (isThenable(result)) {
                thenable = true;
                stopwatch.restart();
                result = await result;
                asyncTime = stopwatch.toString();
            }
            success = true;
        } catch (error) {
            if (!syncTime) syncTime = stopwatch.toString();
            if (thenable && !asyncTime) asyncTime = stopwatch.toString();
            if (!type) type = new Type(error);
            result = error;
            success = false;
        }

        stopwatch.stop();
        if (typeof result !== 'string') {
            result = result instanceof Error ? result.stack : args.getFlags('json') ? JSON.stringify(result, null, 4) : inspect(result, {
                depth: parseInt(args.getOption('depth')) || 0,
                showHidden: args.getFlags('showHidden')
            });
        }
        return { success, type, time: this.formatTime(syncTime, asyncTime), result };
    }

    formatTime(syncTime, asyncTime) {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
    }

    async getHaste(evalResult, language) {
        const { key } = await fetch('https://www.toptal.com/developers/hastebin/documents', { method: 'POST', body: evalResult }).then(response => response.json());
        return `https://www.toptal.com/developers/hastebin/${key}.${language}`;
    }

};
