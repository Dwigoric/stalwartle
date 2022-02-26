const Stalwartle = require('./lib/structures/StalwartleClient');
const { config, token } = require('./config');

// Instantiate Stalwartle
const client = new Stalwartle(config);

// Register editable-commands plugin
require('@sapphire/plugin-editable-commands/register');

const main = async () => {
    try {
        client.logger.info('Logging in...');
        await client.login(token);
        client.logger.info('Sucessfully logged in.');
    } catch (error) {
        client.logger.fatal(error);
        client.destroy();
        process.exit(1);
    }
};

main();
