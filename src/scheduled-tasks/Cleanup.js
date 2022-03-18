const { ScheduledTask } = require('@sapphire/plugin-scheduled-tasks');
const { SnowflakeUtil } = require('discord.js');
const { LoggerStyle, LoggerStyleText } = require('@sapphire/plugin-logger');

module.exports = class MemorySweeper extends ScheduledTask {

    constructor(context, options) {
        super(context, {
            ...options,
            cron: '*/30 * * * *'
        });

        // The colors to stylize the console's logs
        this.colors = {
            red: new LoggerStyle({ text: LoggerStyleText.RedBright }),
            yellow: new LoggerStyle({ text: LoggerStyleText.YellowBright }),
            green: new LoggerStyle({ text: LoggerStyleText.Green })
        };

        // The header with the console colors
        this.header = '[CACHE AND DATABASE CLEANUP]';
    }

    /* eslint complexity: ['warn', 30] */
    async run() {
        const OLD_SNOWFLAKE = SnowflakeUtil.generate(Date.now());
        let guildMembers = 0,
            presences = 0,
            emojis = 0,
            // lastMessages = 0,
            modlogDBs = 0,
            musicDBs = 0,
            users = 0;

        // ----- CACHED DATA SWEEPERS ----- //

        // Per-Guild sweeper
        for (const guild of this.container.client.guilds.cache.values()) {
            // Clear presences
            presences += guild.presences.cache.size;
            guild.presences.cache.clear();

            // Clear members that haven't send a message in the last 30 minutes
            const { me } = guild;
            for (const [id, member] of guild.members.cache) {
                if ([me, guild.owner].includes(member)) continue;
                if (member.voice.channel) continue;
                if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
                guildMembers++;
                guild.members.cache.delete(id);
            }

            // Clear emojis
            emojis += guild.emojis.cache.size;
            guild.emojis.cache.clear();
        }

        // Per-Channel sweeper
        /* for (const channel of this.container.client.channels.cache.values()) {
			if (!channel.lastMessageID) continue;
			channel.lastMessageID = null;
			lastMessages++;
		} */

        // Per-User sweeper
        for (const user of this.container.client.users.cache.values()) {
            if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
            this.container.client.users.cache.delete(user.id);
            users++;
        }

        // Running garbage collection of Node.js
        // if (global.gc) global.gc();

        // ----- PERSISTENT DATA SWEEPERS ----- //

        // Music database sweeper
        for (const music of await this.container.database.getAll('music')) {
            let queue, playlist, history;
            const gateway = this.container.stores.get('gateways').get('musicGateway');

            if (this.container.client.guilds.cache.has(music.id)) {
                if (music.queue && !music.queue.length) {
                    queue = true;
                    await gateway.reset(music.id, 'queue');
                } else if (!music.queue) { queue = true; }

                if (music.playlist && !music.playlist.length) {
                    playlist = true;
                    await gateway.reset(music.id, 'playlist');
                } else if (!music.playlist) { playlist = true; }

                if (music.history && !music.history.length) {
                    history = true;
                    await gateway.reset(music.id, 'history');
                } else if (!music.history) { history = true; }
            } else {
                queue = true;
                playlist = true;
                history = true;
            }

            if (queue && playlist && history) await gateway.delete(music.id);
            else if (!queue && !playlist && !history) continue;
            musicDBs++;
        }

        // Modlog database sweeper
        for (const guildlogs of await this.container.database.getAll('modlogs')) {
            if (guildlogs.modlogs && guildlogs.modlogs.length) continue;
            this.container.stores.get('gateways').get('modlogGateway').delete(guildlogs.id);
            modlogDBs++;
        }

        // Emit a log
        this.container.logger.info([
            this.header,
            `${this.setColor(guildMembers)} [GuildMember]s`,
            `${this.setColor(users)} [User]s`,
            // `${this.setColor(lastMessages)} [Last Message]s`,
            `${this.setColor(presences)} [Presence]s`,
            `${this.setColor(emojis)} [Emoji]s`,
            `${this.setColor(musicDBs)} [MusicDB]s`,
            `${this.setColor(modlogDBs)} [ModlogDB]s`
        ].join('\n'));
    }

    async init() {
        this.run();
    }

    /**
     * Set color depending on the number:
     * > 1000 : Light red color
     * > 100 : Light yellow color
     * < 100 : Green color
     * @param {number} number The number to colorise
     * @returns {string}
     */
    setColor(number) {
        const text = String(number).padStart(5, ' ');
        // Light red color
        if (number > 1000) return this.colors.red.run(text);
        // Light yellow color
        if (number > 100) return this.colors.yellow.run(text);
        // Green color
        return this.colors.green.run(text);
    }

};
