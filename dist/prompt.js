"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyStartupPrompts = applyStartupPrompts;
const promises_1 = require("node:readline/promises");
const node_process_1 = require("node:process");
async function applyStartupPrompts(config) {
    if (!node_process_1.stdin.isTTY)
        return config;
    clearTerminal();
    const reader = (0, promises_1.createInterface)({ input: node_process_1.stdin, output: node_process_1.stdout });
    try {
        const allowedPlayers = parsePlayers(await ask(reader, 'Allowed players', config.bot.allowedPlayers.join(', ')));
        const portAnswer = await ask(reader, 'Bot connection port', String(config.minecraft.port));
        const publicFeedback = parseYesNo(await ask(reader, 'Public chat feedback Y/N', 'N'));
        const disabledFeedback = parseYesNo(await ask(reader, 'Disable chat feedback Y/N', 'N'));
        const feedbackMode = disabledFeedback ? 'disabled' : publicFeedback ? 'public' : 'private';
        return {
            ...config,
            minecraft: {
                ...config.minecraft,
                port: Number.parseInt(portAnswer, 10) || config.minecraft.port
            },
            bot: {
                ...config.bot,
                allowedPlayers,
                feedbackMode
            }
        };
    }
    finally {
        reader.close();
    }
}
async function ask(reader, label, fallback) {
    const answer = await reader.question(`${label} (${fallback}): `);
    return answer.trim() || fallback;
}
function parsePlayers(value) {
    return value.split(',').map(player => player.trim()).filter(Boolean);
}
function parseYesNo(value) {
    return value.trim().toLowerCase().startsWith('y');
}
function clearTerminal() {
    node_process_1.stdout.write('\x1b[2J\x1b[3J\x1b[H');
}
