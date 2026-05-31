"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadTestPlugin = loadTestPlugin;
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
function loadTestPlugin(bot, config) {
    let movements = null;
    bot.once('spawn', () => {
        movements = new mineflayer_pathfinder_1.Movements(bot);
        // Evita que o bot quebre ou coloque blocos no teste inicial.
        movements.canDig = false;
        movements.allow1by1towers = false;
        bot.pathfinder.setMovements(movements);
        console.log(`[test] bot=${bot.username} version=${bot.version} auth=${config.minecraft.auth}`);
    });
    bot.on('chat', (username, message) => {
        if (username === bot.username || !message.startsWith(config.bot.prefix))
            return;
        const command = message.slice(config.bot.prefix.length).trim().split(/\s+/)[0]?.toLowerCase();
        if (!command)
            return;
        if (command === 'status') {
            bot.chat(`Vida: ${formatNumber(bot.health)} | Fome: ${bot.food} | Pos: ${formatPosition(bot)} | Mundo: ${formatWorld(bot)}`);
            return;
        }
        if (command === 'where') {
            bot.chat(`Estou em ${formatPosition(bot)}`);
            return;
        }
        if (command === 'come') {
            const target = bot.players[username]?.entity;
            if (!target) {
                bot.chat(`${username}, nao consigo te ver.`);
                return;
            }
            if (movements)
                bot.pathfinder.setMovements(movements);
            bot.pathfinder.setGoal(new mineflayer_pathfinder_1.goals.GoalNear(target.position.x, target.position.y, target.position.z, 1));
            bot.chat('Indo ate voce.');
            return;
        }
        if (command === 'stop') {
            bot.pathfinder.setGoal(null);
            bot.clearControlStates();
            bot.chat('Pare de me mover.');
        }
    });
}
function formatPosition(bot) {
    const position = bot.entity.position;
    return `${formatNumber(position.x)} ${formatNumber(position.y)} ${formatNumber(position.z)}`;
}
function formatWorld(bot) {
    return String(bot.game.dimension ?? 'desconhecido');
}
function formatNumber(value) {
    return value.toFixed(1);
}
