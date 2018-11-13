const { Command } = require('klasa');
const { User } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			permissionLevel: 9,
			description: language => language.get('COMMAND_BLACKLIST_DESCRIPTION'),
			usage: '<User:user|Guild:guild|guild:string> [...]',
			usageDelim: ' ',
			guarded: true
		});
	}

	async run(msg, usersAndGuilds) {
		usersAndGuilds = new Set(usersAndGuilds);
		const usersAdded = [];
		const usersRemoved = [];
		const guildsAdded = [];
		const guildsRemoved = [];

		for (const userOrGuild of usersAndGuilds) {
			const type = userOrGuild instanceof User ? 'user' : 'guild';

			await this.client.settings.update(`${type}Blacklist`, userOrGuild.id || userOrGuild, msg.guild);

			if (type === 'guild' && this.client.settings.get('guildBlacklist').includes(userOrGuild.id || userOrGuild)) guildsAdded.push(userOrGuild.name || userOrGuild);
			else if (type === 'guild') guildsRemoved.push(userOrGuild.name || userOrGuild);
			else if (type === 'user' && this.client.settings.get('userBlacklist').includes(userOrGuild.id)) usersAdded.push(userOrGuild.username);
			else usersRemoved.push(userOrGuild.username);
		}

		return msg.send(msg.language.get('COMMAND_BLACKLIST_SUCCESS', usersAdded, usersRemoved, guildsAdded, guildsRemoved));
	}

};
