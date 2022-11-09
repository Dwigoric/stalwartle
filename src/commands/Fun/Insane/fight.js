const { Subcommand } = require('@sapphire/plugin-subcommands');
const { CommandOptionsRunTypeEnum } = require('@sapphire/framework');
const { reply } = require('@sapphire/plugin-editable-commands');
const { Timestamp } = require('@sapphire/timestamp');
const { MessageEmbed } = require('discord.js');
const { MessagePrompter } = require('@sapphire/discord.js-utilities');

const currentFights = {};

module.exports = class extends Subcommand {

    constructor(context, options) {
        super(context, {
            ...options,
            runIn: [CommandOptionsRunTypeEnum.GuildText],
            description: 'A fight minigame between two Discord users.',
            subcommands: [
                { name: 'accept', messageRun: 'accept' },
                { name: 'deny', messageRun: 'deny' },
                { name: 'cancel', messageRun: 'cancel' },
                { name: 'default', messageRun: 'default', default: true }
            ]
        });
        this.usage = '[accept|deny|cancel]|(Opponent:user)';
        this.getRandomInt = (min, max) => (Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min)); // eslint-disable-line no-extra-parens
        this.moves = {
            nuke: {
                description: 'Might be destructive! Costs 20 stamina, deals 30-40 damage.',
                minDmg: 30,
                maxDmg: 40,
                stamina: 20
            },
            wrestle: {
                description: 'Pin down your opponent on the ground! Costs 8 stamina, deals 20-25 damage.',
                minDmg: 20,
                maxDmg: 25,
                stamina: 8
            },
            pummel: {
                description: 'Use a hammer to pummel your opponent! Costs 6 stamina, deals 10-15 damage.',
                minDmg: 10,
                maxDmg: 15,
                stamina: 6
            },
            bandage: {
                description: 'Regain 5-7 HP and reduce 25% to 50% damage for next damage received for 2 stamina. Has a 10% chance of not working if the fighter bled too much..',
                stamina: 2
            },
            rest: {
                description: 'Sacrifice your turn to regain 5 stamina.',
                stamina: -5
            },
            retreat: {
                description: 'Retreat from your current fight.'
            }
        };
    }

    async default(msg, args) {
        let opponent = await args.pickResult('user');
        if (!opponent.success) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  Please tell me who among the people in this channel you want to fight.`);
        opponent = opponent.value;

        // Restrictions
        if (opponent.bot) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You cannot challenge bots to a fight. We will automatically win!`);
        if (!this.container.stores.get('gateways').get('userGateway').get(opponent.id, 'acceptFights')) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  This person is currently not accepting fight requests.`);
        if (msg.channel.id in currentFights) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  There is a fight ongoing in this channel. Please wait until the fight is over.`);
        if (opponent.id === msg.author.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You cannot fight against yourself.`);

        currentFights[msg.channel.id] = {
            challenger: msg.author,
            opponent
        };
        this.container.client.setTimeout(() => {
            if (currentFights[msg.channel.id] && currentFights[msg.channel.id].challenger === msg.author && currentFights[msg.channel.id].opponent === opponent) {
                delete currentFights[msg.channel.id];
                return reply(msg, `⚔  ::  Opponent has not replied within 30 seconds. The match is cancelled.`);
            }
            return null;
        }, 30000);
        return reply(msg, {
            allowedMentions: { users: [opponent.id] },
            content: [
                `⚔  ::  Hey ${opponent}, **${msg.author}** wants to challenge you to a fight!`,
                'Please accept or deny the request by',
                `\`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}fight accept\` or \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}fight deny\`.`,
                `You can disable future requests by \`${this.container.stores.get('gateways').get('guildGateway').get(msg.guild.id, 'prefix')}userconf set acceptFights false\`.`
            ].join(' ')
        });
    }

    /* eslint-disable complexity */
    async #fight(channel, challenger, opponent) {
        // Initialize challenger's fight parameters
        const totalChHealth = 100 + (25 * this.container.stores.get('gateways').get('userGateway').get(challenger.id, 'hpBoost'));
        currentFights[channel.id].challenger = {
            health: totalChHealth,
            stamina: 20,
            bandaged: false
        };
        // Initialize opponent's fight parameters
        const totalOpHealth = 100 + (25 * this.container.stores.get('gateways').get('userGateway').get(opponent.id, 'hpBoost'));
        currentFights[channel.id].opponent = {
            health: totalOpHealth,
            stamina: 20,
            bandaged: false
        };

        const challengerData = currentFights[channel.id].challenger;
        const opponentData = currentFights[channel.id].opponent;

        let i = 0;
        let finishingMove = '🏁 Retreated';
        let winner = null;
        const start = Date.now();
        while (challengerData.health > 0 || opponentData.health > 0) {
            i++;
            let count = 0;
            const chHealth = '░'.repeat(10).split('');
            count = Math.ceil(((challengerData.health / totalChHealth)) * chHealth.length);
            chHealth.splice(0, count, '▓'.repeat(count));

            const opHealth = '░'.repeat(10).split('');
            count = Math.ceil(((opponentData.health / totalOpHealth)) * opHealth.length);
            opHealth.splice(0, count, '▓'.repeat(count));

            const moveDescriptions = [];
            for (const [move, data] of Object.entries(this.moves)) moveDescriptions.push(`**${move}**: ${data.description}`);

            const prompter = new MessagePrompter({ content: `${i % 2 ? challenger : opponent}, it's your turn now`, embeds: [new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`Round ${((i + 1) / 2).toFixed()}: ${challenger.tag} vs ${opponent.tag}`)
                .setDescription([
                    `Attacks available: ${Object.keys(this.moves).join(', ')}`,
                    moveDescriptions.join('\n')
                ].join('\n'))
                .addField(challenger.tag, [
                    `Health: ${challengerData.health}/${totalChHealth}`,
                    chHealth.join(''),
                    `Stamina: ${challengerData.stamina}`
                ].join('\n'), true)
                .addField(opponent.tag, [
                    `Health: ${opponentData.health}/${totalOpHealth}`,
                    opHealth.join(''),
                    `Stamina: ${opponentData.stamina}`
                ].join('\n'), true)
                .setFooter({ text: `${(i % 2 ? challenger : opponent).tag}'s turn | Please reply how you want to attack.` })
            ] }, 'message', { timeout: 30000 });
            let response = null;
            do {
                if (prompter.strategy.appliedMessage) prompter.strategy.appliedMessage.delete();
                // skipcq: JS-0032
                response = await prompter.run(channel, i % 2 ? challenger : opponent).catch(() => null);
                if (response === null) {
                    delete currentFights[channel.id];
                    prompter.strategy.appliedMessage.delete();
                    return channel.send('⚔  ::  No one is replying, so I am ending this fight!');
                }
                if (response.content.toLowerCase() in this.moves) {
                    if (this.moves[response.content.toLowerCase()].stamina > currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina) {
                        channel.send(`${this.container.constants.EMOTES.xmark}  ::  Your stamina is too low. Please choose another move.`);
                        response = false;
                        continue;
                    }
                    if (response.content.toLowerCase() === 'rest' && currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina === 20) {
                        channel.send(`${this.container.constants.EMOTES.xmark}  ::  You're too pumped up to rest! Spend your energy. Please choose another move.`);
                        response = false;
                        continue;
                    }
                    if (response.content.toLowerCase() === 'bandage' && currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health === 100) {
                        channel.send(`${this.container.constants.EMOTES.xmark}  ::  You're at your best shape! Please choose another move.`);
                        response = false;
                        continue;
                    }
                }
            } while (response === false || !Object.keys(this.moves).concat([null]).includes(response.content.toLowerCase())); // eslint-disable-line max-len

            prompter.strategy.appliedMessage.delete();
            const move = response.content.toLowerCase();
            let damage = 0;
            let addedHp = 0;
            let bandageSuccess = false;
            if (move === 'retreat') {
                winner = i % 2 ? opponent : challenger;
                break;
            } else if (move === 'bandage') {
                if (Math.random() > 0.1) {
                    bandageSuccess = true;
                    addedHp = this.getRandomInt(5, 7);
                    if (currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health > 100 - addedHp) currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health = 100;
                    else currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health += addedHp;
                }
                currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina -= this.moves[move].stamina;
                currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].bandaged = true;
            } else if (move === 'rest') {
                if (currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina > 15) currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina = 20;
                else currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina -= this.moves[move].stamina;
            } else {
                let damageMultiplier = 1;
                if (currentFights[channel.id][i % 2 ? 'opponent' : 'challenger'].bandaged) {
                    damageMultiplier = this.getRandomInt(50, 75) / 100;
                    currentFights[channel.id][i % 2 ? 'opponent' : 'challenger'].bandaged = false;
                }
                damage = Math.floor(damageMultiplier * this.getRandomInt(this.moves[move].minDmg, this.moves[move].maxDmg));
                currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina -= this.moves[move].stamina;
                currentFights[channel.id][i % 2 ? 'opponent' : 'challenger'].health -= damage;
            }
            let moveResults = [];
            switch (move) {
                case 'bandage': if (bandageSuccess) {
                    moveResults = [
                        `+ ${(i % 2 ? challenger : opponent).tag} bandaged themselves. The next damage they receive will lessen by 25% to 50%.`,
                        `+ ${(i % 2 ? challenger : opponent).tag} received ${addedHp} HP.`
                    ];
                } else { moveResults = [`- ${(i % 2 ? challenger : opponent).tag} bled too much; the bandage did not work.`]; }
                    moveResults.push(`- ${(i % 2 ? challenger : opponent).tag} lost ${this.moves[move].stamina} stamina.`);
                    break;
                case 'rest': moveResults = [
                    `+ ${(i % 2 ? challenger : opponent).tag} rested.`,
                    `+ ${(i % 2 ? challenger : opponent).tag} regained ${-this.moves[move].stamina} stamina.`
                ];
                    break;
                default: moveResults = [
                    `- ${(i % 2 ? challenger : opponent).tag} used ${move} on ${(i % 2 ? opponent : challenger).tag}.`,
                    `- ${(i % 2 ? opponent : challenger).tag} received ${damage} damage.`,
                    `- ${(i % 2 ? challenger : opponent).tag} lost ${this.moves[move].stamina} stamina.`
                ];
            }
            moveResults.unshift('```diff');
            moveResults.push('```');
            channel.send(moveResults.join('\n'));
            if (challengerData.health <= 0 || opponentData.health <= 0) {
                finishingMove = move;
                currentFights[channel.id][challengerData.health <= 0 ? 'challenger' : 'opponent'].health = 0;
                break;
            }
        }

        if (!winner) winner = challengerData.health === opponentData.health ? 'Draw' : challengerData.health > opponentData.health ? challenger : opponent;

        return channel.send({ embeds: [new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${winner.tag} won!`)
            .setDescription([
                '⚔ Match Statistics ⚔',
                `Rounds Taken: **${((i + 1) / 2).toFixed()}**\n`,
                `__**${challenger.tag}**__`,
                `Health: ${challengerData.health}`,
                `Stamina: ${challengerData.stamina}`,
                `__**${opponent.tag}**__`,
                `Health: ${opponentData.health}`,
                `Stamina: ${opponentData.stamina}`,
                `\nMatch Duration: ${new Timestamp(`${Date.now() - start >= 3600000 ? 'HH:' : ''}mm:ss`).display(Date.now() - start)}`,
                `Finishing Move: ${finishingMove}`
            ].join('\n'))
            .setFooter({ text: 'Ended' })
            .setTimestamp()] });
    }
    /* eslint-enable complexity */

    async accept(msg) {
        // eslint-disable-next-line max-len
        if (!(msg.channel.id in currentFights) || msg.author.id !== currentFights[msg.channel.id].opponent.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You do not have any pending fight requests.`);
        await this.#fight(msg.channel, currentFights[msg.channel.id].challenger, currentFights[msg.channel.id].opponent);
        return delete currentFights[msg.channel.id];
    }

    deny(msg) {
        // eslint-disable-next-line max-len
        if (!(msg.channel.id in currentFights) || msg.author.id !== currentFights[msg.channel.id].opponent.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You do not have any pending fight requests.`);
        reply(msg, `${this.container.constants.EMOTES.tick}  ::  You've denied ${currentFights[msg.channel.id].challenger}'s challenge.`);
        delete currentFights[msg.channel.id];
        return null;
    }

    cancel(msg) {
        // eslint-disable-next-line max-len
        if (!(msg.channel.id in currentFights) || msg.author.id !== currentFights[msg.channel.id].opponent.id) return reply(msg, `${this.container.constants.EMOTES.xmark}  ::  You do not have any pending fight requests.`);
        reply(msg, `⚔  ::  ${currentFights[msg.channel.id].challenger.tag} has cancelled their match with ${currentFights[msg.channel.id].opponent.tag}.`);
        delete currentFights[msg.channel.id];
        return null;
    }

};
