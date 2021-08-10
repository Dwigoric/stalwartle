const { Collection } = require('discord.js');

module.exports = class Gateway extends Collection {

	constructor(scope, defaults, manager) {
		super();
		this.scope = scope;
		this.defaults = defaults;
		this.manager = manager;
	}

};
