const { Command, Duration, RichDisplay } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			aliases: ['cookies', 'stalkie', 'stalkies'],
			description: 'Gives a person a cookie!',
			extendedHelp: [
				"If you want to check someone's cookies, just add the `--check` flag. e.g. `s.cookie @Stalwartle --check`",
				'If you want to check your cookies, simply do not give a user.',
				'\nTo look for the leaderboard, use the `lb` subcommand, e.g. `s.cookie lb`.',
				'To get the global leaderboard, use the flag `--global`, e.g. `s.cookie lb --global`'
			].join('\n'),
			usage: '[lb] (Person:user)',
			usageDelim: ' ',
			subcommands: true
		});

		this.createCustomResolver('user', (arg, possible, msg, [action]) => {
			if (['lb'].includes(action)) return undefined;
			if (arg) return this.client.arguments.get('user').run(arg, possible, msg);
			return arg;
		});
	}

	async run(msg, [person]) {
		if (!person) return msg.send(`🍪  ::  You have **${msg.author.settings.cookies}** cookie${msg.author.settings.cookies === 1 ? '' : 's'}.`);
		if (person.id === msg.author.id) throw "<:redTick:399433440975519754>  ::  I know this command gives someone a cookie, but you can't give yourself a cookie! Don't be greedy 😿";
		if (person.id === this.client.user.id) throw `🍪  ::  **${msg.member.displayName}** gave me a cookie! Oh wait, I already have infinite cookies!`;
		if (person.bot) throw '<:redTick:399433440975519754>  ::  I wonder if bots can eat cookies... 🤔';
		const { cookies } = person.settings;
		if (msg.flags.check) return msg.send(`🍪  ::  **${person.tag}** has **${cookies}** cookie${cookies === 1 ? '' : 's'}.`);
		const cookieTask = this.client.schedule.tasks.filter(tk => tk.taskName === 'cookieReset' && tk.data.user === msg.author.id);
		if (cookieTask.length) throw `<:redTick:399433440975519754>  ::  You've just given someone a cookie! You can use it again in ${Duration.toNow(cookieTask[0].time)}.`;
		await this.client.schedule.create('cookieReset', this.client.arguments.get('time').run('1h', 'time', msg), { data: { user: msg.author.id } });
		await person.settings.update('cookies', cookies + 1);
		return msg.send(`🍪  ::  **${msg.member.displayName}** gave ${person} a cookie, with a total of **${cookies + 1}** cookie${!cookies ? '' : 's'}!`);
	}

	async lb(msg) {
		const top10 = [];
		let list = await Promise.all(await this.client.providers.default.getAll('users').then(usr => usr
			.filter(us => us.cookies)
			.sort((a, b) => b.cookies > a.cookies ? 1 : -1)
			.map(async user => this.client.users.get(user.id) || await this.client.users.fetch(user.id))));
		if (!msg.flags.global && msg.guild) list = list.filter(user => msg.guild.members.has(user.id)); // eslint-disable-line max-len
		if (!list.length) throw '🍪  ::  Whoops! It seems no one in this server has any cookie yet!';
		while (list.length) top10.push(list.splice(0, 10));

		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`🍪 ${msg.flags.global || !msg.guild ? 'Global ' : ''}Stalkie Leaderboard`)
		);

		let authorPos;
		top10.forEach((top, tenPower) => {
			display.addPage(template => template.setDescription(top.map((topUser, onePower) => {
				if (topUser === msg.author) authorPos = `${tenPower || ''}${onePower + 1}`;
				return `\`${tenPower && onePower === 9 ? `${tenPower + 1}0` : `${tenPower || ''}${onePower + 1}`}\`. ${topUser.tag} ➱ ${topUser.settings.cookies} Stalkie${topUser.settings.cookies === 1 ? '' : 's'}`; // eslint-disable-line max-len
			}).join('\n\n')));
		});

		return display
			.setFooterSuffix(` | Your Position: ${authorPos ? `#${authorPos}` : 'None'} | You have ${msg.author.settings.cookies} stalkie${msg.author.settings.cookies === 1 ? '' : 's'}.`)
			.run(await msg.channel.send('<a:loading:430269209415516160>  ::  Loading leaderboard...'), { filter: (reaction, user) => user === msg.author });
	}

};
