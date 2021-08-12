module.exports = {

    client: {
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
    },

    user: {
        acceptFights: true,
        afkIgnore: [],
        afktoggle: false,
        bannerWidth: 0,
        cookies: 0,
        hpBoost: 0,
        osu: '',
        timezone: ''
    },

    guild: {
        afkChannelOnAfk: false,
        donation: 0,
        globalBans: false,
        ignored: [],
        logging: true,
        modlogShowContent: true,
        muted: [],
        muteRole: '',
        selfroles: [],
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
            ignoreBots: false,
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
    }

};
