const { Event, util } = require('klasa');
const { WebhookClient, MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(msg, command, params, error) {
		const errorID = (this.client.shard ? this.client.shard.id.toString(36) : '') + Date.now().toString(36);
		if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
		if (error.message) {
			msg
				.send(`⚠ Whoa! You found a bug! Please catch this bug and send it with the **error ID \`${errorID}\`** using the \`bug\` command!${util.codeBlock('xl', error.message)}`)
				.catch(err => this.client.emit('wtf', err));
		} else {
			return msg.sendMessage(error).catch(err => this.client.emit('wtf', err));
		}
		if (typeof error.stack !== 'undefined') {
			return this.hook.send(`${this.client.application.owner}, an error occured with **${this.client.user.tag}**!`, new MessageEmbed()
				.setColor(0xE74C3C)
				.setTitle(`Details of Error ID \`${errorID}\``)
				.setDescription([
					`**Shard ID**: ${this.client.shard ? this.client.shard.id : 'N/A'}`,
					`**Trigerrer**: ${msg.author} (${msg.author.id})`,
					`**Guild**: ${msg.guild ? `${msg.guild.name} (${msg.guild.id})` : '[Direct Messages]'}`,
					`**Channel**: ${msg.guild ? `#${msg.channel.name}` : '[Direct Messages]'} (${msg.channel.id})`,
					`**Command**: \`${msg.content}\``,
					util.codeBlock('js', error.message),
					util.codeBlock('xl', error.stack)
				])
			);
		}
		return error.stack;
	}

	async init() {
		this.hook = new WebhookClient(this.client.settings.errorHook.id, this.client.settings.errorHook.token);
	}

};
