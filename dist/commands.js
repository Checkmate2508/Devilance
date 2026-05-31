"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCommands = loadCommands;
const mineflayer_collectblock_1 = require("mineflayer-collectblock");
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const feedback_1 = require("./feedback");
const FOLLOW_WALK_DISTANCE = 4;
const FOLLOW_SPRINT_DISTANCE = 8;
const FLOOD_INTERVAL_MS = 2000;
function loadCommands(bot, config) {
    let movements = null;
    let floodTimer = null;
    let followTargetName = null;
    let followOwner = null;
    bot.loadPlugin(mineflayer_collectblock_1.plugin);
    bot.once('spawn', () => {
        movements = new mineflayer_pathfinder_1.Movements(bot);
        movements.canDig = false;
        movements.allow1by1towers = false;
        movements.allowSprinting = true;
        bot.pathfinder.setMovements(movements);
    });
    bot.on('chat', (username, message) => {
        if (username === bot.username || !message.startsWith(config.bot.prefix))
            return;
        if (!isAllowed(username, config.bot.allowedPlayers))
            return;
        const input = parseCommand(message, config.bot.prefix);
        if (!input)
            return;
        if (input.command === 'come') {
            clearFollow(false);
            const target = bot.players[username]?.entity;
            if (!target) {
                (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'I cannot see you');
                return;
            }
            setMovements();
            bot.pathfinder.setGoal(new mineflayer_pathfinder_1.goals.GoalNear(target.position.x, target.position.y, target.position.z, 1));
            (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'Coming to you');
            return;
        }
        if (input.command === 'speak') {
            if (!input.args) {
                (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'Usage: !speak message');
                return;
            }
            bot.chat(input.args);
            return;
        }
        if (input.command === 'flood') {
            if (input.args.toLowerCase() === 'stop') {
                stopFlood();
                (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'Flood stopped');
                return;
            }
            if (!input.args) {
                (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'Usage: !flood message');
                return;
            }
            startFlood(input.args);
            (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'Flood started');
            return;
        }
        if (input.command === 'follow') {
            if (!input.args) {
                (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, 'Usage: !follow player');
                return;
            }
            const targetName = input.args.toLowerCase() === 'me' ? username : input.args;
            const target = bot.players[targetName]?.entity;
            if (!target) {
                (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, `I cannot see ${targetName}`);
                return;
            }
            setMovements();
            followTargetName = targetName;
            followOwner = username;
            bot.pathfinder.setGoal(new mineflayer_pathfinder_1.goals.GoalFollow(target, 2), true);
            (0, feedback_1.sendFeedback)(bot, username, config.bot.feedbackMode, `Following ${targetName}`);
        }
    });
    bot.on('physicsTick', () => {
        if (!followTargetName)
            return;
        const target = bot.players[followTargetName]?.entity;
        if (!target) {
            const owner = followOwner;
            clearFollow(true);
            if (owner)
                (0, feedback_1.sendFeedback)(bot, owner, config.bot.feedbackMode, 'Follow target lost');
            return;
        }
        updateSprint(target);
    });
    bot.once('end', () => {
        stopFlood();
        clearFollow(false);
    });
    function setMovements() {
        if (movements)
            bot.pathfinder.setMovements(movements);
    }
    function startFlood(message) {
        stopFlood();
        bot.chat(message);
        floodTimer = setInterval(() => bot.chat(message), FLOOD_INTERVAL_MS);
    }
    function stopFlood() {
        if (!floodTimer)
            return;
        clearInterval(floodTimer);
        floodTimer = null;
    }
    function clearFollow(stopPath) {
        followTargetName = null;
        followOwner = null;
        bot.setControlState?.('sprint', false);
        if (stopPath)
            bot.pathfinder?.setGoal(null);
    }
    function updateSprint(target) {
        const distance = bot.entity.position.distanceTo(target.position);
        if (distance >= FOLLOW_SPRINT_DISTANCE) {
            bot.setControlState('sprint', true);
            return;
        }
        if (distance <= FOLLOW_WALK_DISTANCE) {
            bot.setControlState('sprint', false);
        }
    }
}
function parseCommand(message, prefix) {
    const content = message.slice(prefix.length).trim();
    if (!content)
        return null;
    const [command = '', ...parts] = content.split(/\s+/);
    return {
        command: command.toLowerCase(),
        args: parts.join(' ').trim()
    };
}
function isAllowed(username, allowedPlayers) {
    return allowedPlayers.some(player => player.toLowerCase() === username.toLowerCase());
}
