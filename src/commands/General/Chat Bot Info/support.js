const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['hub'],
			guarded: true,
			description: 'Gives you the invite link to my server where you can view the changelog and hang out with us!'
		});
	}

	async run(msg) {
		msg.send({
			embed: await new MessageEmbed()
				.setColor('RANDOM')
				.setDescription('Please visit my dev server (<https://discord.gg/ZzjZ8ba>) and go to the questions and support channel so we can give you the utmost support.')
		});
	}

};
