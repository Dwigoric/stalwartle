const { Command, util: { toTitleCase } } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment-timezone');

const MODS = Object.freeze({
    None: 0,
    // NoFail
    NF: 1,
    // Easy
    EZ: 2,
    // Not used anymore, but can be found on old plays like Mesita on b/78239
    NoVideo: 4,
    // Hidden
    HD: 8,
    // HardRock
    HR: 16,
    // SuddenDeath
    SD: 32,
    // DoubleTime
    DT: 64,
    // Relax
    RE: 128,
    // HalfTime
    HT: 256,
    // Only set along with DoubleTime. i.e: NC only gives 576
    // Nightcore
    NC: 512,
    // Flashlight
    FL: 1024,
    // Autoplay
    AU: 2048,
    // SpunOut
    SO: 4096,
    // Autopilot (Relax2)
    AP: 8192,
    // Only set along with SuddenDeath. i.e: PF only gives 16416
    PF: 16384,
    '4K': 32768,
    '5K': 65536,
    '6K': 131072,
    '7K': 262144,
    '8K': 524288,
    // keyMod: this.Key4 | this.Key5 | this.Key6 | this.Key7 | this.Key8,
    // Fade-in
    FI: 1048576,
    // Random
    RD: 2097152,
    // LastMod
    LM: 4194304,
    // FreeModAllowed: this.NoFail | this.Easy | this.Hidden | this.HardRock | this.SuddenDeath | this.Flashlight | this.FadeIn | this.Relax | this.Relax2 | this.SpunOut | this.keyMod,
    '9K': 16777216,
    '10K': 33554432,
    '1K': 67108864,
    '3K': 134217728,
    '2K': 268435456
});

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            requiredPermissions: ['EMBED_LINKS'],
            description: 'Gets information about an osu! user.',
            extendedHelp: [
                'If you want to have a default osu! username every query, use the `s.userconf` command.\n',
                '- If you want to change the mode, use the flags `--taiko`, `--catch`, or `--mania`. Do not supply a flag if you want osu! standard mode. The default mode is osu! standard.',
                "- If you want to get information about a beatmap, use the `beatmap` subcommand and supply the beatmap's ID. Be reminded that the beatmap ID varies from difficulty to difficulty.",
                "- If you want to get a user's best/recent plays, use the `best` or `recent` subcommands and supply the username.",
                '- If you simply want to get information about a user, do not use any subcommand and supply the username. (e.g. `s.osu dwigoric`)'
            ].join('\n'),
            usage: '[best|recent|beatmap] (BeatmapID|Username:string) [...]',
            usageDelim: ' ',
            subcommands: true
        });

        this.createCustomResolver('string', (arg, possible, msg) => {
            const osu = msg.author.settings.get('osu');
            if (osu && !arg) return osu;
            if (!arg) throw `${this.client.constants.EMOTES.xmark}  ::  You did not provide a search query. Do you want a default osu! account? Use \`s.userconf set osu <username here>\`.`;
            return arg;
        });
    }

    async run(msg, [...username]) {
        await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading user information...`);

        let mode;
        if (msg.flagArgs.mania) mode = 3;
        else if (msg.flagArgs.catch) mode = 2;
        else if (msg.flagArgs.taiko) mode = 1;
        else mode = 0;

        const params = new URLSearchParams();
        params.set('k', this.client.auth.osuAPIkey);
        params.set('m', mode);
        params.set('u', username.join(this.usageDelim));
        params.set('type', 'string');
        const request = await fetch(`https://osu.ppy.sh/api/get_user?${params}`).then(res => res.json());
        if (!request.length) throw `${this.client.constants.EMOTES.xmark}  ::  Whoops! You supplied an invalid osu! username.`;

        const user = request[0];
        const accuracy = `${+`${`${Math.round(`${`${Number(user.accuracy)}e+2`}`)}e-2`}`}%`;
        const thumbnails = [
            'https://syrin.me/static/img/osu!next_icons/mode-0-sm.png',
            'http://sig.ripple.moe/img/taiko.png',
            'https://syrin.me/static/img/osu!next_icons/mode-2-sm.png',
            'https://lemmmy.pw/osusig/img/mania.png'
        ];

        const embed = new MessageEmbed()
            .setColor(0xF462A3)
            .setThumbnail(thumbnails[mode])
            .setAuthor('User Information', 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Osu%21Logo_%282015%29.png')
            .setTitle(`${user.username} (PP Rank #${Number(user.pp_rank).toLocaleString()})`)
            .setURL(`https://osu.ppy.sh/users/${user.user_id}/`)
            .addField(`Country Rank (${user.country})`, Number(user.pp_country_rank).toLocaleString(), true)
            .addField(`Level ${parseInt(user.level)}`, `${+`${`${Math.round(`${`${(user.level - parseInt(user.level)) * 100}e+2`}`)}e-2`}`}% gained to level ${parseInt(user.level) + 1}`, true)
            .addField('Hits', [`300s: ${Number(user.count300).toLocaleString()}`, `100s: ${Number(user.count100).toLocaleString()}`, `50s: ${Number(user.count50).toLocaleString()}`], true)
            .addField('Accuracy', accuracy, true)
            .addField('Playcount', Number(user.playcount).toLocaleString(), true)
            .addField('Ranked Score', Number(user.ranked_score).toLocaleString(), true)
            .addField('Total Score', Number(user.total_score).toLocaleString(), true)
            .addField('Map Rank Counts', [
                `SS+ → ${user.count_rank_ssh}`,
                `SS → ${user.count_rank_ss}`,
                `S+ → ${user.count_rank_sh}`,
                `S → ${user.count_rank_s}`,
                `A → ${user.count_rank_a}`
            ]);

        msg.send(embed);
    }

    async beatmap(msg, [...mapID]) {
        const timezone = msg.author.settings.get('timezone');

        let mode;
        if (msg.flagArgs.mania) mode = 3;
        else if (msg.flagArgs.catch) mode = 2;
        else if (msg.flagArgs.taiko) mode = 1;
        else mode = 0;

        await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading beatmap...`);

        const params = new URLSearchParams();
        params.set('k', this.client.auth.osuAPIkey);
        params.set('b', mapID[0]);
        params.set('m', mode);
        const request = await fetch(`https://osu.ppy.sh/api/get_beatmaps?${params}`).then(res => res.json());
        if (!request.length) throw `${this.client.constants.EMOTES.xmark}  ::  Whoops! You supplied an invalid osu! beatmap ID, or the beatmap does not support that mode.`;

        const beatmap = request[0];
        const genres = ['Any', 'Unspecified', 'Video Game', 'Anime', 'Rock', 'Pop', 'Other', 'Novelty', null, 'Hip-Hop', 'Electronic'];
        const languages = ['Any', 'Other', 'English', 'Japanese', 'Chinese', 'Instrumental', 'Korean', 'French', 'German', 'Swedish', 'Spanish', 'Italian'];
        const thumbnails = [
            'https://syrin.me/static/img/osu!next_icons/mode-0-sm.png',
            'http://sig.ripple.moe/img/taiko.png',
            'https://syrin.me/static/img/osu!next_icons/mode-2-sm.png',
            'https://lemmmy.pw/osusig/img/mania.png'
        ];

        const embed = new MessageEmbed()
            .setColor(0xF462A3)
            .setAuthor('Beatmap Information', 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Osu%21Logo_%282015%29.png')
            .setThumbnail(thumbnails[Number(beatmap.mode)])
            .setTitle(`Mapped by ${beatmap.creator}`)
            .setURL(`https://osu.ppy.sh/beatmaps/${beatmap.beatmap_id}`)
            .setDescription(`${beatmap.title}\nby ${beatmap.artist}`)
            .setFooter('Click "Mapped by" at the top to download the beatmap')
            .addField('Difficulty', beatmap.version, true)
            .addField('Tempo', `${Number(beatmap.bpm).toLocaleString()}bpm`, true)
            .addField('Stars', `${+`${`${Math.round(`${`${Number(beatmap.difficultyrating)}e+2`}`)}e-2`}`}⭐`, true)
            .addField('Hit Length', `${beatmap.hit_length} seconds from first to\nlast note without breaks`, true)
            .addField('Total Length', `${beatmap.total_length} seconds from first to\nlast note including breaks`, true)
            .addField('Max Combo', Number(beatmap.max_combo).toLocaleString(), true)
            .addField('Playcount', Number(beatmap.playcount).toLocaleString(), true)
            .addField('Genre', genres[Number(beatmap.genre_id)], true)
            .addField('Language', languages[Number(beatmap.language_id)], true);
        if (beatmap.tags.length) embed.addField('Tags', beatmap.tags.split(' ').join(', '), true);
        embed.addField('Approved', moment(beatmap.approved_date).tz(timezone).format('dddd, LL | LTS'), true);

        msg.send(embed);
    }

    async best(msg, [...username]) {
        return await this.top(msg, username.join(this.usageDelim), 'best');
    }

    async recent(msg, [...username]) {
        return await this.top(msg, username.join(this.usageDelim), 'recent');
    }

    async top(msg, username, type) {
        await msg.send(`${this.client.constants.EMOTES.loading}  ::  Loading ${type} plays...`);

        const timezone = msg.author.settings.get('timezone');

        let mode;
        if (msg.flagArgs.mania) mode = 3;
        else if (msg.flagArgs.catch) mode = 2;
        else if (msg.flagArgs.taiko) mode = 1;
        else mode = 0;
        const osumode = [' Standard', 'taiko', 'catch', 'mania'];

        const errString = {
            recent: user => `**${user.username}** hasn't played **osu!${osumode[mode]}** mode in the last 24 hours.`,
            best: user => `**${user.username}** doesn't have best plays on **osu!${osumode[mode]}** mode yet.`
        };

        const params = new URLSearchParams();
        params.set('k', this.client.auth.osuAPIkey);
        params.set('u', username);
        params.set('type', 'string');
        const userReq = await fetch(`https://osu.ppy.sh/api/get_user?${params}`).then(res => res.json());
        if (!userReq.length) throw `${this.client.constants.EMOTES.xmark}  ::  Whoops! You supplied an invalid osu! username.`;
        const user = userReq[0];

        params.set('u', user.user_id);
        params.set('type', 'id');
        params.set('m', mode);
        params.set('limit', 5);
        const request = await fetch(`https://osu.ppy.sh/api/get_user_${type}?${params}`).then(res => res.json());
        if (!request.length) throw `${this.client.constants.EMOTES.xmark}  ::  Whoops! ${errString[type](user)}`;

        const top = await Promise.all(request.map(async list => {
            let urank;
            switch (list.rank) {
                case 'XH':
                    urank = 'SS+';
                    break;
                case 'SH':
                    urank = 'S+';
                    break;
                case 'X':
                    urank = 'SS';
                    break;
                default:
                    urank = list.rank;
                    break;
            }

            const mods = [];
            for (const mod in MODS) {
                if (mod === 'None') continue;
                const val = MODS[mod];
                if ((parseInt(list.enabled_mods) & val) === val) mods.push(mod);
            }
            if (mods.includes('NC') && mods.includes('DT')) mods.splice(mods.indexOf('DT'), 1);
            if (mods.includes('PF') && mods.includes('SD')) mods.splice(mods.indexOf('SD'), 1);

            params.delete('u');
            params.delete('m');
            params.delete('type');
            params.delete('limit');
            params.set('b', list.beatmap_id);
            const beatmap = await fetch(`https://osu.ppy.sh/api/get_beatmaps?${params}`)
                .then(res => res.json())
                .then(b => b[0]);
            const requests = Object.values(request).map(body => body.date);
            const stats = [`Rank ${urank}`, `Score: ${Number(list.score).toLocaleString()}`, `Combo: ${Number(list.maxcombo).toLocaleString()}${beatmap.max_combo ? `/${Number(beatmap.max_combo).toLocaleString()}` : ''}`]; // eslint-disable-line max-len
            if (list.pp) stats.splice(2, 0, `${list.pp}pp`);
            return [
                `\`${requests.indexOf(list.date) + 1}\`: **[${beatmap.title}${beatmap.version ? ` [${beatmap.version}]` : ''}](https://osu.ppy.sh/b/${beatmap.beatmap_id})**${mods.length ? ` **${mods.map(mod => `+${mod}`).join(' ')}**` : ''} [${+`${`${Math.round(`${`${Number(beatmap.difficultyrating)}e+2`}`)}e-2`}`}⭐]`, // eslint-disable-line max-len
                `${[`Mapper: [${beatmap.creator}](https://osu.ppy.sh/users/${encodeURIComponent(beatmap.creator)})`, `Artist: ${beatmap.artist}`, `Beatmap ID: ${list.beatmap_id}`].join(' | ')}`,
                `[  **${stats.join('**  |  **')}**  ]`,
                `Date: ${moment(list.date).tz(timezone).format('dddd, LL | LTS z')}`
            ].join('\n\t');
        }));

        const embed = new MessageEmbed()
            .setColor(0xF462A3)
            .setAuthor(`${toTitleCase(type)} Plays on osu!${osumode[mode]}`, 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Osu%21Logo_%282015%29.png')
            .setTitle(user.username)
            .setURL(`https://osu.ppy.sh/users/${user.user_id}/`)
            .setDescription(top.join('\n\n'));

        return msg.send(embed).catch(() => { throw `${this.client.constants.EMOTES.xmark}  ::  **${user.username}** hasn't played **osu!${osumode[mode]}** yet!`; });
    }

};
