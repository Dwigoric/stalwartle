const { Extendable, KlasaGuild } = require('klasa');

module.exports = class extends Extendable {

	constructor(...args) { super(...args, { appliesTo: [KlasaGuild] });	}

	get voteskips() {
		if (!this._voteskips) return [];
		return this._voteskips;
	}

	addVoteskip(vote, members) {
		if (!this._voteskips) Object.defineProperty(this, '_voteskips', { value: [] });
		this._voteskips.push(vote);
		Object.defineProperty(this, '_voteskips', { value: this._voteskips.filter(voter => members.has(voter)) });
	}

	clearVoteskips() {
		return delete this._voteskips;
	}

};
