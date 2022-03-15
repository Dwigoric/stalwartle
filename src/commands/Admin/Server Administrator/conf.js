const { CommandOptionsRunTypeEnum, Resolvers } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { SubCommandPluginCommand } = require('@sapphire/plugin-subcommands');
const { toTitleCase, codeBlock, isObject } = require('@sapphire/utilities');

module.exports = class extends SubCommandPluginCommand {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            preconditions: ['ModsOnly'],
            description: 'Define per-server settings.',
            subCommands: ['set', 'show', 'remove', 'reset', { input: 'default', default: true }]
        });
        this.usage = '<set|show|remove|reset> (key:string) (value:any) [...]';
        this.guarded = true;
    }

    default(message) {
        return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Please tell me whether you want to \`set\`, \`show\`, \`remove\`, or \`reset\` a configuration key.`);
    }

    async show(message, args) {
        const key = await args.pick('string').catch(() => null);

        const guildGateway = this.container.stores.get('gateways').get('guildGateway');
        const path = guildGateway.get(message.guild.id, key, true);
        if (path === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The key **${key}** does not seem to exist.`);

        if (isObject(path)) {
            const array = [];
            const folders = [];
            const keys = {};
            let longest = 0;
            for (const [type, value] of Object.entries(path)) {
                if (isObject(value)) {
                    folders.push(`// ${type}`);
                } else {
                    const schemaType = guildGateway.getType(`${key || ''}.${type}`);
                    if (schemaType === null) continue;
                    if (!(schemaType.type in keys)) keys[schemaType.type] = [];
                    if (type.length > longest) longest = type.length;
                    keys[schemaType.type].push(type);
                }
            }

            const keysTypes = Object.keys(keys);
            if (!folders.length && !keysTypes.length) array.push('');
            if (folders.length) array.push('= Folders =', ...folders.sort(), '');
            if (keysTypes.length) {
                for (const keyType of keysTypes.sort()) {
                    array.push(`= ${toTitleCase(keyType)}s =`,
                        ...await Promise.all(keys[keyType].sort().map(async ref => `${ref.padEnd(longest)} :: ${await this.#resolveString(message, guildGateway.getType(`${key || ''}.${ref}`), path[ref])}`)),
                        '');
                }
            }

            return reply(message, `**Server Settings${[
                key ? `: ${key.split('.').map(toTitleCase).join('/')}**` : '**',
                codeBlock('asciidoc', array.join('\n'))
            ].join('\n')}`);
        }
        return reply(message, `${this.container.constants.EMOTES.tick}  ::  The value for the key **${key}** is \`${await this.#resolveString(message, guildGateway.getType(key), path)}\`.`);
    }

    async set(message, args) {
        const key = await args.pick('string').catch(() => null);
        if (key === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You must provide a key.`);
        const valueToSet = await args.rest('string').catch(() => null);
        if (valueToSet === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You must provide a value.`);

        const path = this.container.stores.get('gateways').get('guildGateway').get(message.guild.id, key, true);
        const type = this.container.stores.get('gateways').get('guildGateway').getType(key);
        if (path === null || type.type === 'object') return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The key **${key}** does not seem to exist.`);

        let resolvedValue;
        if (type.type === 'command') {
            const command = this.store.get(valueToSet);
            if (!command) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Not a valid command name.`);
            if (command.guarded) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  That command is guarded and cannot be disabled.`);
            resolvedValue = command.name;
        } else {
            const resolved = await Resolvers[`resolve${type.type.replace(/^./, letter => letter.toUpperCase())}`](valueToSet, this.#getResolverOptions(type, message));
            if (!resolved.success) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You supplied an invalid entry.`);
            resolvedValue = resolved.value;
        }

        if (Array.isArray(path) && type.isArray) {
            if (path.indexOf(resolvedValue.id || resolvedValue) !== -1) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Value already included in key.`);
            else path.push(resolvedValue.id || resolvedValue);
        } else if (Array.isArray(path) && !type.isArray) {
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The new value of key was not supposed to be an array, but I resolved one.`);
        } else if (!Array.isArray(path) && type.isArray) {
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The new value of key was supposed to be an array, but I did not resolve one.`);
        } else if ((resolvedValue.id || resolvedValue) === path) {
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  No changes made!`);
        }

        const status = await this.container.stores.get('gateways').get('guildGateway').update(message.guild.id, key, type.isArray ? path : resolvedValue.id || resolvedValue).catch(error => error);
        if (status) return reply(message, `${this.container.constants.EMOTES.tick}  ::  Successfully updated the key **${key}**:\`${await this.#resolveString(message, type, type.isArray ? path : resolvedValue.id || resolvedValue)}\``);
        return reply(message, `${this.container.constants.EMOTES.xmark}  ::  ${status.message}`);
    }

    async remove(message, args) {
        const key = await args.pick('string').catch(() => null);
        if (key === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You must provide a key.`);
        const valueToRemove = await args.rest('string').catch(() => null);
        if (valueToRemove === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You must provide a value.`);

        const path = this.container.stores.get('gateways').get('guildGateway').get(message.guild.id, key, true);
        const type = this.container.stores.get('gateways').get('guildGateway').getType(key);
        if (path === null || type.type === 'object') return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The key **${key}** does not seem to exist.`);

        let resolvedValue;
        if (type.type === 'command') {
            const command = this.store.get(valueToRemove);
            if (!command) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Not a valid command name.`);
            if (command.guarded) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  That command is guarded and cannot be disabled.`);
            resolvedValue = command.name;
        } else {
            const resolved = await Resolvers[`resolve${type.type.replace(/^./, letter => letter.toUpperCase())}`](valueToRemove, this.#getResolverOptions(type, message));
            if (!resolved.success) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You supplied an invalid entry.`);
            resolvedValue = resolved.value;
        }

        if (Array.isArray(path) && type.isArray) {
            if (path.indexOf(resolvedValue.id || resolvedValue) === -1) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  Value already not included in key.`);
            else path.splice(path.indexOf(resolvedValue.id || resolvedValue), 1);
        } else if (Array.isArray(path) && !type.isArray) {
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The new value of key was not supposed to be an array, but I resolved one.`);
        } else if (!Array.isArray(path) && type.isArray) {
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The new value of key was supposed to be an array, but I did not resolve one.`);
        } else if ((resolvedValue.id || resolvedValue) === path) {
            return reply(message, `${this.container.constants.EMOTES.xmark}  ::  No changes made!`);
        }

        const status = await this.container.stores.get('gateways').get('guildGateway').update(message.guild.id, key, type.isArray ? path : resolvedValue.id || resolvedValue).catch(error => error);
        if (status) return reply(message, `${this.container.constants.EMOTES.tick}  ::  Successfully updated the key **${key}**:\`${await this.#resolveString(message, type, type.isArray ? path : resolvedValue.id || resolvedValue)}\``);
        return reply(message, `${this.container.constants.EMOTES.xmark}  ::  ${status.message}`);
    }

    async reset(message, args) {
        const key = await args.pick('string').catch(() => null);
        if (key === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  You must provide a key.`);

        const path = this.container.stores.get('gateways').get('guildGateway').get(message.guild.id, key, true);
        if (path === null) return reply(message, `${this.container.constants.EMOTES.xmark}  ::  The key **${key}** does not seem to exist.`);

        const status = await this.container.stores.get('gateways').get('guildGateway').reset(message.guild.id, key).catch(error => error);
        if (status) return reply(message, `${this.container.constants.EMOTES.tick}  ::  Successfully reset the key **${key}**.`);
        return reply(message, `${this.container.constants.EMOTES.xmark}  ::  ${status.message}`);
    }

    #getResolverOptions(type, message) {
        return {
            boolean: { truths: ['true', 'yes', 'y', '1'], falses: ['false', 'no', 'n', '0'] },
            channel: message,
            DMChannel: message,
            float: { maximum: isNaN(type.maximum) ? undefined : type.maximum, minimum: isNaN(type.minimum) ? undefined : type.minimum },
            guildCategoryChannel: message.guild,
            guildChannel: message.guild,
            guildNewsChannel: message.guild,
            guildNewsThreadChannel: message.guild,
            guildPrivateThreadChannel: message.guild,
            guildPublicThreadChannel: message.guild,
            guildStageVoiceChannel: message.guild,
            guildTextChannel: message.guild,
            guildThreadChannel: message.guild,
            guildVoiceChannel: message.guild,
            integer: { maximum: isNaN(type.maximum) ? undefined : parseInt(type.maximum), minimum: isNaN(type.minimum) ? undefined : parseInt(type.minimum) },
            member: message.guild,
            number: { maximum: isNaN(type.maximum) ? undefined : type.maximum, minimum: isNaN(type.minimum) ? undefined : type.minimum },
            partialDMChannel: message,
            role: message.guild,
            string: { maximum: isNaN(type.maximum) ? undefined : parseInt(type.maximum), minimum: isNaN(type.minimum) ? undefined : parseInt(type.minimum) }
        }[type.type];
    }

    async #resolveString(message, type, value) {
        if (value === null) return 'Not set';
        let resolvedValue;
        if (Array.isArray(value)) {
            return value.length ? type.type === 'command' ? `[ ${value.join(' | ')} ]` : `[ ${await Promise.all(value.map(async val => {
                resolvedValue = (await Resolvers[`resolve${type.type.replace(/^./, letter => letter.toUpperCase())}`](val, this.#getResolverOptions(type, message))).value;
                if (resolvedValue) return resolvedValue.name || resolvedValue;
                return val;
            })).then(values => values.join(' | '))} ]` : 'None';
        }
        resolvedValue = (await Resolvers[`resolve${type.type.replace(/^./, letter => letter.toUpperCase())}`](String(value), this.#getResolverOptions(type, message))).value;
        if (typeof resolvedValue === 'boolean') return resolvedValue ? 'Enabled' : 'Disabled';
        if (resolvedValue) return resolvedValue.name || resolvedValue;
        return String(value);
    }

};
