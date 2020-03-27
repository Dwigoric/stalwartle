const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [GuildMember] }); }

	async addMessage(message) {
		this.messages.push(message);
		this.client.setTimeout(() => {
			this.messages.shift();
		}, this.guild.settings.get('automod.options.antiSpam.within') * 1000);
	}

};
