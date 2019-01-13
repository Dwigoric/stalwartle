const { Extendable, KlasaGuild } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [KlasaGuild] });	}

	get voteskips() {
		return this._voteskips || [];
	}

	addVoteskip(vote, members) {
		if (!this._voteskips) this._voteskips = [];
		this._voteskips.push(vote);
		this._voteskips = this._voteskips.filter(voter => members.has(voter));
	}

	clearVoteskips() {
		return delete this._voteskips;
	}

};
