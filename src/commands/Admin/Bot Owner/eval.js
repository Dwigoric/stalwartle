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

// Function definitions
function formatTime(syncTime, asyncTime) {
    return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
}

async function getHaste(evalResult, language) {
    const { key } = await fetch('https://www.toptal.com/developers/hastebin/documents', { method: 'POST', body: evalResult }).then(response => response.json());
    return `https://www.toptal.com/developers/hastebin/${key}.${language}`;
}

async function custEval(code, { async = false, json = false, showHidden = false, depth } = {}) {
    const stopwatch = new Stopwatch();
    // skipcq: JS-0083
    code = code.replace(/[“”]/gu, '"').replace(/[‘’]/gu, "'");
    let success = false, syncTime = '', asyncTime = '', result = null;
    let thenable = false;
    let type = null;
    try {
        // skipcq: JS-0083
        if (async) code = `(async () => {\n${code}\n})();`;
        // skipcq: JS-0060
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
        result = result instanceof Error ? result.stack : json ? JSON.stringify(result, null, 4) : inspect(result, {
            depth: parseInt(depth, 10) || 0,
            showHidden
        });
    }
    return { success, type, time: formatTime(syncTime, asyncTime), result };
}

function timedEval(code, flagTime, options) {
    if (flagTime === Infinity || flagTime === 0) return custEval(code, options);
    return Promise.race([
        sleep(flagTime).then(() => ({
            success: false,
            result: `TIMEOUT: Took longer than ${flagTime / 1000} seconds.`,
            time: '⏱ ...',
            type: 'EvalTimeoutError'
        })),
        custEval(code, options)
    ]);
}

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
                'If the output is too large, it\'ll send the output as a file, or in the console if the bot does not have the ATTACH_FILES permission.',
                'The --no-timeout flag will disable the timeout.',
                'The --wait flag accepts a number of milliseconds to wait for a result.'
            ].join('\n'),
            flags: ['async', 'json', 'log', 'no-timeout', 'showHidden', 'silent'],
            options: ['depth', 'lang', 'language', 'output', 'output-to', 'wait'],
            preconditions: ['DevsOnly']
        });
        this.usage = '<expression:string>';
        this.timeout = 30000;
        this.guarded = true;
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand(builder =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption(option =>
                    option
                        .setName('expression')
                        .setDescription('The code to evaluate.')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option
                        .setName('no-timeout')
                        .setDescription('Evaluate code without a timeout.'))
                .addIntegerOption(option =>
                    option
                        .setName('wait')
                        .setDescription('The time (in ms) to wait for a result.'))
                .addStringOption(option =>
                    option
                        .setName('language')
                        .setDescription('The language to use for the output.'))
                .addBooleanOption(option =>
                    option
                        .setName('async')
                        .setDescription('Evaluate code as an async function.'))
                .addBooleanOption(option =>
                    option
                        .setName('json')
                        .setDescription('Evaluate code as JSON.'))
                .addBooleanOption(option =>
                    option
                        .setName('show-hidden')
                        .setDescription('Evaluate code with the showHidden option enabled.'))
                .addBooleanOption(option =>
                    option
                        .setName('silent')
                        .setDescription('Evaluate code without output.'))
                .addIntegerOption(option =>
                    option
                        .setName('depth')
                        .setDescription('The depth to use for the output.'))
                .addStringOption(option =>
                    option
                        .setName('output')
                        .setDescription('The output to use for the result.'))
                .addBooleanOption(option =>
                    option
                        .setName('log')
                        .setDescription('Evaluate code and log the result.'))
                .addBooleanOption(option =>
                    option
                        .setName('ephemeral')
                        .setDescription('Whether the response should be ephemeral.'))
        , {
            idHints: ['1015443733308780614']
        });
    }

    async chatInputRun(interaction) {
        const { options } = interaction;
        const code = options.getString('expression');

        const flagTime = options.getBoolean('no-timeout') ? Infinity : options.getInteger('wait') || this.timeout;
        const language = options.getString('language') || 'js';
        const { success, result, time, type } = await timedEval(code, flagTime, {
            async: options.getBoolean('async'),
            json: options.getBoolean('json'),
            showHidden: options.getBoolean('show-hidden'),
            depth: options.getInteger('depth')
        });

        if (options.getBoolean('silent')) {
            if (!success && result && result.stack) this.client.emit('error', result.stack);
            return null;
        }

        const footer = codeBlock('ts', type);
        const sendAs = options.getString('output') || options.getBoolean('log') ? 'log' : null;
        return interaction.reply({ ...await this.handleMessage(interaction, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language }), ephemeral: options.getBoolean('ephemeral') });
    }

    async messageRun(msg, args) {
        const code = await args.rest('string').then(str => str.trim()).catch(() => null);
        if (code === null) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  No code was supplied to be evaluated.`);
        const flagTime = args.getFlags('no-timeout') ? Infinity : Number(args.getOption('wait')) || this.timeout;
        const language = args.getOption('lang') || args.getOption('language') || (args.getFlags('json') ? 'json' : 'js');
        const { success, result, time, type } = await timedEval(code, flagTime, { async: args.getFlags('async'), json: args.getFlags('json'), showHidden: args.getFlags('showHidden'), depth: args.getOption('depth') });

        if (args.getFlags('silent')) {
            if (!success && result && result.stack) this.container.client.emit('error', result.stack);
            return null;
        }

        const footer = codeBlock('ts', type);
        const sendAs = args.getOption('output') || args.getOption('output-to') || (args.getFlags('log') ? 'log' : null);
        return reply(msg, await this.handleMessage(msg, { sendAs, hastebinUnavailable: false, url: null }, { success, result, time, footer, language }));
    }

    async handleMessage(medium, options, { success, result, time, footer, language }) {
        switch (options.sendAs) {
            case 'file': {
                if (!medium.guild || medium.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) {
                    return {
                        files: [{ name: 'output.txt', attachment: Buffer.from(result) }],
                        content: `Sent the result as a file.\n**Type**:${footer}\n${time}`
                    };
                }
                await this.getTypeOutput(medium, options);
                return this.handleMessage(medium, options, { success, result, time, footer, language });
            }
            case 'haste':
            case 'hastebin': {
                if (!options.url) options.url = await getHaste(result, language).catch(() => null);
                if (options.url) return { content: `Sent the result to hastebin: <${options.url}>\n**Type**:${footer}\n${time}` };
                options.hastebinUnavailable = true;
                await this.getTypeOutput(medium, options);
                return this.handleMessage(medium, options, { success, result, time, footer, language });
            }
            case 'console':
            case 'log': {
                this.container.logger.debug(result);
                return { content: `Sent the result to console.\n**Type**:${footer}\n${time}` };
            }
            case 'none':
                return { content: `Aborted eval.` };
            default: {
                if (result.length > 2000) {
                    await this.getTypeOutput(medium, options);
                    return this.handleMessage(medium, options, { success, result, time, footer, language });
                }
                return { content: `**${success ? 'Output' : 'Error'}**:${codeBlock(success ? language : 'xl', result)}\n**Type**:${footer}\n${time}` };
            }
        }
    }

    async getTypeOutput(medium, options) {
        const _options = ['log'];
        if (!medium.guild || medium.channel.permissionsFor(this.container.client.user).has(['SEND_MESSAGES', 'ATTACH_FILES'])) _options.push('file');
        if (!options.hastebinUnavailable) _options.push('hastebin');
        const handler = new MessagePrompter(`Choose one of the following options: ${_options.join(', ')}`, 'message');
        let _choice = null;
        do {
            if (handler.strategy.appliedMessage) handler.strategy.appliedMessage.delete();
            _choice = await handler.run(medium.channel, medium.author || medium.user).catch(() => ({ content: 'none' }));
        } while (!['file', 'haste', 'hastebin', 'console', 'log', 'default', 'none'].includes(_choice.content));
        handler.strategy.appliedMessage.delete();
        options.sendAs = _choice.content;
    }

};
