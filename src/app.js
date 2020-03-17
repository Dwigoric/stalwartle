const StalwartleClient = require('./lib/structures/StalwartleClient');
const { config, token } = require('./config');
const { Schema } = require('klasa');

const Stalwartle = new StalwartleClient(config);

Stalwartle.gateways
	.register('afk', {
		provider: Stalwartle.options.providers.default,
		schema: new Schema()
			.add('isAfk', 'boolean', { default: false })
			.add('reason', 'string', { default: null })
			.add('timestamp', 'number')
	})
	.register('modlogs', {
		provider: Stalwartle.options.providers.default,
		schema: new Schema()
			.add('modlogs', 'any', { array: true })
	})
	.register('music', {
		provider: Stalwartle.options.providers.default,
		schema: new Schema()
			.add('history', 'any', { array: true })
			.add('playlist', 'any', { array: true })
			.add('queue', 'any', { array: true })
	});

Stalwartle.login(token);
