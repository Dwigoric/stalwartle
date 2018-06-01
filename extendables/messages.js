const { Extendable } = require('klasa');

module.exports = class Messages extends Extendable {

	constructor(...args) {
		super(...args, { appliesTo: ['GuildMember'] });
	}

	get extend() {
		if (!Messages[this.id]) Messages[this.id] = [];
		return Messages[this.id];
	}

	set extend(message) {
		if (!Messages[this.id]) Messages[this.id] = [];
		Messages[this.id].push(message);
		this.client.setTimeout(() => Messages[this.id].shift(), 5000);
	}

};
