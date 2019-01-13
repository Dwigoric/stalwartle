const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class Messages extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
	}

	get messages() {
		if (!Messages[this.id]) Messages[this.id] = [];
		return Messages[this.id];
	}

	async addMessage(message) {
		if (!Messages[this.id]) Messages[this.id] = [];
		Messages[this.id].push(message);
		this.client.setTimeout(() => {
			Messages[this.id].shift();
			if (!Messages[this.id].length) delete Messages[this.id];
		}, this.guild.settings.get('automod.options.antiSpam.within') * 1000);
	}

};
