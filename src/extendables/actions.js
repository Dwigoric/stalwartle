const { Extendable } = require('klasa');
const { GuildMember } = require('discord.js');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [GuildMember] }); }

	get actions() {
		return this.actions || [];
	}

	async addAction(action) {
		if (!this._actions) this._actions = [];
		this._actions.push(action);
		this.client.setTimeout(() => {
			this._actions.shift();
			if (!this._actions.length) this.resetActions();
		}, this.guild.settings.get('automod.options.quota.within') * 60000);
	}

	async resetActions() {
		return delete this._actions;
	}

};
