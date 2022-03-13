const afk = Object.freeze({
    reason: 'string',
    timestamp: 'date'
});

const modlogs = Object.freeze({
    modlogs: 'any[]'
});

const music = Object.freeze({
    queue: 'any[]',
    history: 'any[]',
    playlist: 'any[]'
});

const client = Object.freeze({
    userBlacklist: 'user[]',
    guildBlacklist: 'string[]',
    changelogs: 'guildTextChannel',
    bugs: {
        reports: 'guildTextChannel',
        processed: 'guildTextChannel'
    },
    suggestions: {
        reports: 'guildTextChannel',
        processed: 'guildTextChannel'
    },
    errorHook: {
        id: 'guildTextChannel',
        token: 'string'
    },
    guildHook: {
        id: 'guildTextChannel',
        token: 'string'
    },
    restart: {
        channel: 'channel',
        timestamp: 'date'
    }
});

const users = Object.freeze({
    acceptFights: 'boolean',
    afkIgnore: 'guildTextChannel[]',
    afktoggle: 'boolean',
    bannerWidth: 'integer',
    cookies: '!integer',
    hpBoost: '!integer',
    osu: 'string',
    timezone: '!string'
});

const guilds = Object.freeze({
    prefix: 'string',
    disableNaturalPrefix: 'boolean',
    disabledCommands: 'command',
    afkChannelOnAfk: 'boolean',
    donation: '!integer',
    globalBans: 'boolean',
    ignored: 'guildTextChannel[]',
    logging: 'boolean',
    selfroles: 'role[]',
    autorole: {
        user: 'role',
        bot: 'role'
    },
    moderators: {
        users: 'user[]',
        roles: 'role[]'
    },
    modlogs: {
        ban: 'guildTextChannel',
        kick: 'guildTextChannel',
        mute: 'guildTextChannel',
        softban: 'guildTextChannel',
        unban: 'guildTextChannel',
        unmute: 'guildTextChannel',
        warn: 'guildTextChannel'
    },
    music: {
        limitToChannel: 'guildVoiceChannel[]',
        announceChannel: 'guildTextChannel',
        announceSongs: 'boolean',
        autoplay: 'boolean',
        dj: 'role[]',
        maxPlaylist: 'integer{1,1000}',
        maxQueue: 'integer{1,1000}',
        maxUserRequests: 'integer{1,1000}',
        noDuplicates: 'boolean',
        repeat: '!string',
        volume: '!integer{1,300}'
    },
    automod: {
        ignoreBots: 'boolean',
        ignoreMods: 'boolean',
        antiInvite: 'boolean',
        quota: 'boolean',
        antiSpam: 'boolean',
        antiSwear: 'boolean',
        mentionSpam: 'boolean',
        globalSwears: 'boolean',
        swearWords: 'string[]',
        filterIgnore: {
            antiInvite: 'guildTextChannel[]',
            antiSpam: 'guildTextChannel[]',
            antiSwear: 'guildTextChannel[]',
            mentionSpam: 'guildTextChannel[]'
        },
        options: {
            antiInvite: {
                action: '!string',
                duration: 'integer{1,43200}'
            },
            quota: {
                action: '!string',
                limit: 'integer{3,50}',
                within: 'integer{1,1440}',
                duration: 'integer{1,43200}'
            },
            antiSpam: {
                action: '!string',
                limit: 'integer{5,50}',
                within: 'integer{3,600}',
                duration: 'integer{1,43200}'
            },
            antiSwear: {
                action: '!string',
                duration: 'integer{1,43200}'
            },
            mentionSpam: {
                action: '!string',
                duration: 'integer{1,43200}'
            }
        }
    }
});

function getRegex() {
    return /(!)?([A-Z]+)(\[\])?({([0-9]*),([0-9]*)})?/gi;
}

function isValidSchemaType(type) {
    return getRegex().test(type);
}

function isConfigurableSchema(type) {
    if (!isValidSchemaType(type)) return false;
    return Boolean(getRegex().exec(type)[1] !== '!');
}

function getBaseSchemaType(type) {
    if (!isValidSchemaType(type)) return null;
    return getRegex().exec(type)[2];
}

function isSchemaArray(type) {
    if (!isValidSchemaType(type)) return false;
    return Boolean(getRegex().exec(type)[3]);
}

function getSchemaMinimum(type) {
    if (!isValidSchemaType(type)) return null;
    return parseInt(getRegex().exec(type)[5]);
}

function getSchemaMaximum(type) {
    if (!isValidSchemaType(type)) return null;
    return parseInt(getRegex().exec(type)[6]);
}

module.exports = {
    afk,
    modlogs,
    music,
    client,
    users,
    guilds,
    isValidSchemaType,
    isConfigurableSchema,
    getBaseSchemaType,
    isSchemaArray,
    getSchemaMinimum,
    getSchemaMaximum
};
