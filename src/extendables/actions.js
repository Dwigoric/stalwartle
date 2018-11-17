const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class Actions extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: [GuildMember] });
	}

	get actions() {
		if (!Actions[this.id]) Actions[this.id] = [];
		return Actions[this.id];
	}

	async addAction(action) {
		if (!Actions[this.id]) Actions[this.id] = [];
		Actions[this.id].push(action);
		this.client.setTimeout(() => Actions[this.id].shift(), this.guild.settings.get('automod.options.quota.within') * 60000);
	}

	async resetActions() {
		Actions[this.id] = [];
	}

};
