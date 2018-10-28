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
		this.client.setTimeout(() => Actions[this.id].shift(), 300000);
	}

	resetActions() {
		Actions[this.id] = [];
	}

};
