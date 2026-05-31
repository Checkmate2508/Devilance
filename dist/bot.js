"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = createBot;
const mineflayer_1 = __importDefault(require("mineflayer"));
const mineflayer_armor_manager_1 = __importDefault(require("mineflayer-armor-manager"));
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const mineflayer_statemachine_1 = require("mineflayer-statemachine");
const commands_1 = require("./commands");
const logger_1 = require("./logger");
function createBot(config) {
    const options = {
        host: config.minecraft.host,
        port: config.minecraft.port,
        username: config.minecraft.username,
        auth: config.minecraft.auth,
        version: config.minecraft.version,
        viewDistance: 'tiny',
        logErrors: false
    };
    const bot = mineflayer_1.default.createBot(options);
    mineflayer_statemachine_1.globalSettings.debugMode = false;
    bot.loadPlugin(mineflayer_pathfinder_1.pathfinder);
    bot.loadPlugin(mineflayer_armor_manager_1.default);
    (0, commands_1.loadCommands)(bot, config);
    const autoEatReady = import('mineflayer-auto-eat')
        .then(({ loader }) => {
        bot.loadPlugin(loader);
    })
        .catch(error => {
        logger_1.logger.error(`Auto eat failed to load: ${error.message}`);
    });
    bot.once('spawn', async () => {
        await autoEatReady;
        if (bot.autoEat) {
            bot.autoEat.setOpts({
                minHunger: 16,
                minHealth: 14,
                returnToLastItem: true
            });
            bot.autoEat.enableAuto();
        }
        void bot.armorManager.equipAll().catch(error => {
            logger_1.logger.error(`Armor manager failed: ${error.message}`);
        });
    });
    if (config.viewer.enabled) {
        bot.once('spawn', async () => {
            try {
                const { mineflayer: viewer } = await import('prismarine-viewer');
                viewer(bot, { port: config.viewer.port, firstPerson: true });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                logger_1.logger.error(`Viewer failed to load: ${message}`);
            }
        });
    }
    return bot;
}
