const { Command, Timestamp } = require('@sapphire/framework');
const { MessageEmbed } = require('discord.js');

const currentFights = {};

module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            description: 'A fight minigame between two Discord users.',
            usage: '[accept|deny|cancel] (Opponent:user)',
            subcommands: true
        });

        this.createCustomResolver('user', (arg, possible, message, [action]) => {
            if (!action && !arg) throw `${this.client.constants.EMOTES.xmark}  ::  Please tell me who you want to challenge to a fight.`;
            if (action) return undefined;
            return this.client.arguments.get('user').run(arg, possible, message);
        });

        this.getRandomInt = (min, max) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
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

    async run(msg, [opponent]) {
        // Restrictions
        if (opponent.bot) throw `${this.client.constants.EMOTES.xmark}  ::  You cannot challenge bots to a fight. We will automatically win!`;
        if (!opponent.settings.get('acceptFights')) throw `${this.client.constants.EMOTES.xmark}  ::  This person is currently not accepting fight requests.`;
        if (msg.channel.id in currentFights) throw `${this.client.constants.EMOTES.xmark}  ::  There is a fight ongoing in this channel. Please wait until the fight is over.`;
        if (opponent.equals(msg.author)) throw `${this.client.constants.EMOTES.xmark}  ::  You cannot fight against yourself.`;

        currentFights[msg.channel.id] = {
            challenger: msg.author,
            opponent
        };
        this.client.setTimeout(() => {
            if (currentFights[msg.channel.id] && currentFights[msg.channel.id].challenger === msg.author && currentFights[msg.channel.id].opponent === opponent) {
                delete currentFights[msg.channel.id];
                return msg.send(`⚔  ::  Opponent has not replied within 30 seconds. The match is cancelled.`);
            }
            return null;
        }, 30000);
        msg.send(`⚔  ::  Hey ${opponent}, **${msg.member.displayName}** wants to challenge you to a fight! Please accept or deny the request by \`${msg.guild.settings.get('prefix')}fight accept\` or \`${msg.guild.settings.get('prefix')}fight deny\`. You can disable future requests by \`${msg.guild.settings.get('prefix')}userconf set acceptFights false\`.`); // eslint-disable-line max-len
    }

    /* eslint-disable complexity */
    async fight(channel, challenger, opponent) {
        // Initialize challenger's fight parameters
        const totalChHealth = 100 + (25 * challenger.settings.get('hpBoost'));
        currentFights[channel.id].challenger = {
            health: totalChHealth,
            stamina: 20,
            bandaged: false
        };
        // Initialize opponent's fight parameters
        const totalOpHealth = 100 + (25 * opponent.settings.get('hpBoost'));
        currentFights[channel.id].opponent = {
            health: totalOpHealth,
            stamina: 20,
            bandaged: false
        };

        const challengerData = currentFights[channel.id].challenger;
        const opponentData = currentFights[channel.id].opponent;

        let i = 0;
        let finishingMove = '🏁 Retreated';
        let winner;
        const start = Date.now();
        while (challengerData.health > 0 || opponentData.health > 0) {
            i++;
            let count;
            const chHealth = '░'.repeat(10).split('');
            count = Math.ceil(((challengerData.health / totalChHealth)) * chHealth.length);
            chHealth.splice(0, count, '▓'.repeat(count));

            const opHealth = '░'.repeat(10).split('');
            count = Math.ceil(((opponentData.health / totalOpHealth)) * opHealth.length);
            opHealth.splice(0, count, '▓'.repeat(count));

            const moveDescriptions = [];
            for (const [move, data] of Object.entries(this.moves)) moveDescriptions.push(`**${move}**: ${data.description}`);

            const message = await channel.send(`${i % 2 ? challenger : opponent}, it's your turn now`, { embed: new MessageEmbed()
                .setColor('RANDOM')
                .setTitle(`Round ${parseInt((i + 1) / 2)}: ${challenger.tag} vs ${opponent.tag}`)
                .setDescription([
                    `Attacks available: ${Object.keys(this.moves).join(', ')}`,
                    moveDescriptions.join('\n')
                ])
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
                .setFooter(`${(i % 2 ? challenger : opponent).tag}'s turn | Please reply how you want to attack.`) });

            let responses;
            do {
                responses = await channel.awaitMessages(msg => msg.author === (i % 2 ? challenger : opponent), { time: 30000, max: 1 });
                if (responses.size === 0) {
                    delete currentFights[channel.id];
                    throw '⚔  ::  No one is replying, so I am ending this fight!';
                }
                if (responses.first() && responses.first().content.toLowerCase() in this.moves) {
                    if (this.moves[responses.first().content.toLowerCase()].stamina > currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina) {
                        channel.send(`${this.client.constants.EMOTES.xmark}  ::  Your stamina is too low. Please choose another move.`);
                        responses.first().content = false;
                        continue;
                    }
                    if (responses.first().content.toLowerCase() === 'rest' && currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].stamina === 20) {
                        channel.send(`${this.client.constants.EMOTES.xmark}  ::  You're too pumped up to rest! Spend your energy. Please choose another move.`);
                        responses.first().content = false;
                        continue;
                    }
                    if (responses.first().content.toLowerCase() === 'bandage' && currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health === 100) {
                        channel.send(`${this.client.constants.EMOTES.xmark}  ::  You're at your best shape! Please choose another move.`);
                        responses.first().content = false;
                        continue;
                    }
                }
            } while (responses.first().content === false || !Object.keys(this.moves).concat([null]).includes(responses.first().content.toLowerCase())); // eslint-disable-line max-len
            message.delete();

            const move = responses.first().content.toLowerCase();
            let damage;
            let addedHp;
            let bandageSuccess;
            if (move === 'retreat') {
                winner = i % 2 ? opponent : challenger;
                break;
            } else if (move === 'bandage') {
                if (Math.random() > 0.1) {
                    bandageSuccess = true;
                    addedHp = this.getRandomInt(5, 7);
                    if (currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health > 100 - addedHp) currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health = 100;
                    else currentFights[channel.id][i % 2 ? 'challenger' : 'opponent'].health += addedHp;
                } else { bandageSuccess = false; }
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
            let moveResults;
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

        return channel.sendEmbed(new MessageEmbed()
            .setColor('RANDOM')
            .setTitle(`${winner.tag} won!`)
            .setDescription([
                '⚔ Match Statistics ⚔',
                `Rounds Taken: **${parseInt((i + 1) / 2)}**\n`,
                `__**${challenger.tag}**__`,
                `Health: ${challengerData.health}`,
                `Stamina: ${challengerData.stamina}`,
                `__**${opponent.tag}**__`,
                `Health: ${opponentData.health}`,
                `Stamina: ${opponentData.stamina}`,
                `\nMatch Duration: ${new Timestamp(`${Date.now() - start >= 3600000 ? 'HH:' : ''}mm:ss`).display(Date.now() - start)}`,
                `Finishing Move: ${finishingMove}`
            ])
            .setFooter('Ended')
            .setTimestamp());
    }
    /* eslint-enable complexity */

    async accept(msg) {
        // eslint-disable-next-line max-len
        if (!(msg.channel.id in currentFights) || !msg.author.equals(currentFights[msg.channel.id].opponent)) throw `${this.client.constants.EMOTES.xmark}  ::  You do not have any pending fight requests.`;
        await this.fight(msg.channel, currentFights[msg.channel.id].challenger, currentFights[msg.channel.id].opponent);
        return delete currentFights[msg.channel.id];
    }

    async deny(msg) {
        // eslint-disable-next-line max-len
        if (!(msg.channel.id in currentFights) || !msg.author.equals(currentFights[msg.channel.id].opponent)) throw `${this.client.constants.EMOTES.xmark}  ::  You do not have any pending fight requests.`;
        msg.send(`${this.client.constants.EMOTES.tick}  ::  You've denied ${currentFights[msg.channel.id].challenger}'s challenge.`);
        return delete currentFights[msg.channel.id];
    }

    async cancel(msg) {
        // eslint-disable-next-line max-len
        if (!(msg.channel.id in currentFights) || !msg.author.equals(currentFights[msg.channel.id].challenger)) throw `${this.client.constants.EMOTES.xmark}  ::  You do not have any pending fight requests.`;
        msg.send(`⚔  ::  ${currentFights[msg.channel.id].challenger.tag} has cancelled their match with ${currentFights[msg.channel.id].opponent.tag}.`);
        return delete currentFights[msg.channel.id];
    }

};
