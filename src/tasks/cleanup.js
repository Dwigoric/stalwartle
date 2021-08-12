const { Task, Colors } = require('@sapphire/framework');
const { Util: { binaryToID } } = require('discord.js');

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30,
    EPOCH = 1420070400000,
    EMPTY = '0000100000000000000000';

module.exports = class MemorySweeper extends Task {

    constructor(...args) {
        super(...args);

        // The colors to stylise the console's logs
        this.colors = {
            red: new Colors({ text: 'lightred' }),
            yellow: new Colors({ text: 'lightyellow' }),
            green: new Colors({ text: 'green' })
        };

        // The header with the console colors
        this.header = new Colors({ text: 'lightblue' }).format('[CACHE AND DATABASE CLEANUP]');
    }

    /* eslint complexity: ['warn', 30] */
    async run() {
        const OLD_SNOWFLAKE = binaryToID(((Date.now() - THRESHOLD) - EPOCH).toString(2).padStart(42, '0') + EMPTY);
        let guildMembers = 0,
            presences = 0,
            emojis = 0,
            // lastMessages = 0,
            modlogDBs = 0,
            musicDBs = 0,
            users = 0;

        // ----- CACHED DATA SWEEPERS ----- //

        // Per-Guild sweeper
        for (const guild of this.client.guilds.cache.values()) {
            // Clear presences
            presences += guild.presences.cache.size;
            guild.presences.cache.clear();

            // Clear members that haven't send a message in the last 30 minutes
            const { me } = guild;
            for (const [id, member] of guild.members.cache) {
                if ([me, guild.owner].includes(member)) continue;
                if (member.voice.channel) continue;
                if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
                if (member.user.settings.get('cookies')) continue;
                guildMembers++;
                guild.members.cache.delete(id);
            }

            // Clear emojis
            emojis += guild.emojis.cache.size;
            guild.emojis.cache.clear();
        }

        // Per-Channel sweeper
        /* for (const channel of this.client.channels.cache.values()) {
			if (!channel.lastMessageID) continue;
			channel.lastMessageID = null;
			lastMessages++;
		} */

        // Per-User sweeper
        for (const user of this.client.users.cache.values()) {
            if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
            if (user.settings.get('cookies')) continue;
            this.client.users.cache.delete(user.id);
            users++;
        }

        // Running garbage collection of Node.js
        if (global.gc) global.gc();

        // ----- PERSISTENT DATA SWEEPERS ----- //

        // Music database sweeper
        for (const { history, id, playlist, queue } of await this.client.providers.default.getAll('music')) {
            if (history.length || playlist.length) continue;
            if (this.client.guilds.cache.has(id) && queue.length) continue;
            this.client.providers.default.delete('music', id);
            musicDBs++;
        }

        // Modlog database sweeper
        for (const { id, modlogs } of await this.client.providers.default.getAll('modlogs')) {
            if (modlogs.length) continue;
            this.client.providers.default.delete('modlogs', id);
            modlogDBs++;
        }

        // Emit a log
        this.client.emit('log', [
            this.header,
            `${this.setColor(guildMembers)} [GuildMember]s`,
            `${this.setColor(users)} [User]s`,
            // `${this.setColor(lastMessages)} [Last Message]s`,
            `${this.setColor(presences)} [Presence]s`,
            `${this.setColor(emojis)} [Emoji]s`,
            `${this.setColor(musicDBs)} [MusicDB]s`,
            `${this.setColor(modlogDBs)} [ModlogDB]s`
        ].join('\n'));

        // Create a schedule to make this task work
        if (this.client.settings.get('schedules').filter(tk => tk.taskName === this.name).length >= 1) return;
        await this.client.schedule.create(this.name, '*/10 * * * *', { catchUp: false });
    }

    async init() {
        this.run();
    }

    /**
	 * Set a colour depending on the amount:
	 * > 1000 : Light Red colour
	 * > 100  : Light Yellow colour
	 * < 100  : Green colour
	 * @since 3.0.0
	 * @param {number} number The number to colourise
	 * @returns {string}
	 */
    setColor(number) {
        const text = String(number).padStart(5, ' ');
        // Light Red color
        if (number > 1000) return this.colors.red.format(text);
        // Light Yellow color
        if (number > 100) return this.colors.yellow.format(text);
        // Green color
        return this.colors.green.format(text);
    }

};
