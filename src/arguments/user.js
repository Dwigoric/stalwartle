const { Argument, util: { regExpEsc } } = require('klasa');
const { GuildMember, User } = require('discord.js');

const USER_REGEXP = Argument.regex.userOrMember;

module.exports = class extends Argument {

	async run(arg, possible, msg) {
		const resUser = await this.resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const results = [];
		if (msg.guild) {
			const reg = new RegExp(regExpEsc(arg), 'i');
			for (const member of msg.guild.members.values()) {
				if (reg.test(member.user.username)) results.push(member.user);
				if (new RegExp(arg, 'i').test(member.nickname) && !results.includes(member.user)) results.push(member.user);
			}
		}

		let querySearch;
		if (results.length > 0) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(user => regWord.test(user.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw `<:error:508595005481549846>  ::  \`${possible.name}\` must be a valid user tag, ID, mention, or nickname.`;
			case 1: return querySearch[0];
			default: throw `Found multiple matches: ${querySearch.map(result => `\`${result.tag}\` (\`${result.id}\`)`).join(', ')}`;
		}
	}

	async resolveUser(query, guild) {
		if (query instanceof GuildMember) return query.user;
		if (query instanceof User) return query;
		if (typeof query === 'string') {
			if (USER_REGEXP.test(query)) return this.client.users.fetch(USER_REGEXP.exec(query)[1]).catch(() => null);
			if (guild && /\w{1,32}#\d{4}/.test(query)) {
				const res = guild.members.find(member => member.user.tag === query);
				return res ? this.client.users.fetch(res.id) : null;
			}
		}
		return null;
	}

};
