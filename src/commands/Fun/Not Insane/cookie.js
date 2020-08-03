const { Command, Duration, RichDisplay, util: { chunk } } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 10,
			runIn: ['text'],
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
		if (!person) return msg.send(`🍪  ::  You have **${msg.author.settings.get('cookies')}** cookie${msg.author.settings.get('cookies') === 1 ? '' : 's'}.`);
		if (person.id === msg.author.id) throw `${this.client.constants.EMOTES.xmark}  ::  I know this command gives someone a cookie, but you can't give yourself a cookie! Don't be greedy 😿`;
		if (person.equals(this.client.user)) throw `🍪  ::  **${msg.member.displayName}** gave me a cookie! Oh wait, I already have infinite cookies!`;
		if (person.bot) throw `${this.client.constants.EMOTES.xmark}  ::  I wonder if bots can eat cookies... 🤔`;
		const cookies = person.settings.get('cookies');
		if (msg.flagArgs.check) return msg.send(`🍪  ::  **${person.tag}** has **${cookies}** cookie${cookies === 1 ? '' : 's'}.`);
		const cookieTask = this.client.schedule.tasks.filter(tk => tk.taskName === 'cookieReset' && tk.data.user === msg.author.id);
		if (cookieTask.length) throw `${this.client.constants.EMOTES.xmark}  ::  You've just given someone a cookie! You can use it again in ${Duration.toNow(cookieTask[0].time)}.`;
		await this.client.schedule.create('cookieReset', this.client.arguments.get('time').run('1h', 'time', msg), { data: { user: msg.author.id } });
		await person.settings.update('cookies', cookies + 1);
		return msg.send(`🍪  ::  **${msg.member.displayName}** gave ${person} a cookie, with a total of **${cookies + 1}** cookie${!cookies ? '' : 's'}!`);
	}

	async lb(msg) {
		if (!msg.channel.permissionsFor(this.client.user).has(['EMBED_LINKS', 'MANAGE_MESSAGES'])) throw `${this.client.constants.EMOTES.xmark}  ::  I need to be able to **Embed Links** and **Manage Messages** (permissions).`; // eslint-disable-line max-len
		const message = await msg.channel.send(`${this.client.constants.EMOTES.loading}  ::  Loading leaderboard...`);
		let list = await this.getList();
		if (!msg.flagArgs.global) list = list.filter(user => msg.guild.members.cache.has(user.id)); // eslint-disable-line max-len
		if (!list.length) throw '🍪  ::  Whoops! It seems no one in this server has any cookie yet!';
		list = chunk(list, 10);

		const display = new RichDisplay(new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`🍪 ${msg.flagArgs.global ? 'Global ' : ''}Stalkie Leaderboard`)
		);

		let authorPos;
		list.forEach((top, tenPower) => {
			display.addPage(template => template.setDescription(top.map((topUser, onePower) => {
				const currentPos = onePower === 9 ? (tenPower + 1) * 10 : (tenPower * 10) + (onePower + 1);
				if (msg.author.equals(topUser)) authorPos = currentPos;
				return `\`${currentPos}\`. ${topUser.tag} ➱ ${topUser.settings.get('cookies')} Stalkie${topUser.settings.get('cookies') === 1 ? '' : 's'}`; // eslint-disable-line max-len
			}).join('\n\n')));
		});

		return display
			.setFooterSuffix(` | Your Position: ${authorPos ? `#${authorPos}` : 'None'} | You have ${msg.author.settings.get('cookies')} stalkie${msg.author.settings.get('cookies') === 1 ? '' : 's'}.`)
			.run(message, { filter: (reaction, user) => msg.author.equals(user) });
	}

	async getList() {
		return Promise.all(await this.client.providers.default.getAll('users').then(usr => usr
			.filter(us => us.cookies)
			.sort((a, b) => b.cookies > a.cookies ? 1 : -1)
			.map(async user => await this.client.users.fetch(user.id))));
	}

	async init() {
		this.getList();
	}

};
