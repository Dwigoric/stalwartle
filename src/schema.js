const { config: { defaultPrefix } } = require('./config');

const afk = Object.freeze({
    reason: null,
    timestamp: null
});

const modlogs = Object.freeze({
    modlogs: []
});

const music = Object.freeze({
    queue: [],
    history: [],
    playlist: []
});

const client = Object.freeze({
    userBlacklist: [],
    guildBlacklist: [],
    changelogs: '',
    bugs: {
        reports: '',
        processed: ''
    },
    suggestions: {
        reports: '',
        processed: ''
    },
    errorHook: {
        id: '',
        token: ''
    },
    guildHook: {
        id: '',
        token: ''
    },
    restart: {
        channel: '',
        timestamp: ''
    }
});

const users = Object.freeze({
    acceptFights: true,
    afkIgnore: [],
    afktoggle: false,
    bannerWidth: 0,
    cookies: 0,
    hpBoost: 0,
    osu: '',
    timezone: 'UTC'
});

const guilds = Object.freeze({
    prefix: defaultPrefix,
    disableNaturalPrefix: false,
    disabledCommands: [],
    afkChannelOnAfk: false,
    donation: 0,
    globalBans: false,
    ignored: [],
    logging: true,
    selfroles: [],
    allowRemindEveryone: false,
    autorole: {
        user: '',
        bot: ''
    },
    moderators: {
        users: [],
        roles: []
    },
    modlogs: {
        ban: '',
        kick: '',
        mute: '',
        softban: '',
        unban: '',
        unmute: '',
        warn: ''
    },
    music: {
        limitToChannel: [],
        announceChannel: '',
        announceSongs: true,
        autoplay: false,
        dj: [],
        maxPlaylist: 1000,
        maxQueue: 1000,
        maxUserRequests: 250,
        noDuplicates: false,
        repeat: 'none',
        volume: 100
    },
    automod: {
        ignoreBots: true,
        ignoreMods: false,
        antiInvite: false,
        quota: true,
        antiSpam: false,
        antiSwear: false,
        mentionSpam: false,
        globalSwears: true,
        swearWords: [],
        filterIgnore: {
            antiInvite: [],
            antiSpam: [],
            antiSwear: [],
            mentionSpam: []
        },
        options: {
            antiInvite: {
                action: 'warn',
                duration: 5
            },
            quota: {
                action: 'mute',
                limit: 3,
                within: 5,
                duration: 10
            },
            antiSpam: {
                action: 'mute',
                limit: 5,
                within: 5,
                duration: 5
            },
            antiSwear: {
                action: 'warn',
                duration: 5
            },
            mentionSpam: {
                action: 'ban',
                duration: 30
            }
        }
    }
});

module.exports = {
    afk,
    modlogs,
    music,
    client,
    users,
    guilds
};
