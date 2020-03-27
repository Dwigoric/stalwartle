const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [GuildMember] }); }

	async addAction(action) {
		this.actions.push(action);
		this.client.setTimeout(() => {
			this.actions.shift();
		}, this.guild.settings.get('automod.options.quota.within') * 60000);
	}

	async resetActions() {
		this.actions = [];
	}

};
