"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotManager = void 0;
const bot_1 = require("./bot");
const logger_1 = require("./logger");
class BotManager {
    config;
    bot = null;
    reconnectTimer = null;
    stopped = true;
    nextDelayMs;
    lastError = '';
    lastErrorAt = 0;
    constructor(config) {
        this.config = config;
        this.nextDelayMs = config.reconnect.delayMs;
    }
    start() {
        if (this.bot)
            return this.bot;
        this.stopped = false;
        this.clearReconnectTimer();
        logger_1.logger.bot(`Connecting to ${this.config.minecraft.host}:${this.config.minecraft.port}`);
        try {
            this.bot = (0, bot_1.createBot)(this.config);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            logger_1.logger.error(`Failed to create bot: ${message}`);
            this.scheduleReconnect();
            return null;
        }
        this.bindEvents(this.bot);
        return this.bot;
    }
    stop(reason = 'Stopped manually') {
        this.stopped = true;
        this.clearReconnectTimer();
        const bot = this.bot;
        this.bot = null;
        if (bot) {
            bot.clearControlStates?.();
            bot.end(reason);
        }
    }
    getBot() {
        return this.bot;
    }
    bindEvents(bot) {
        bot.once('spawn', () => {
            this.nextDelayMs = this.config.reconnect.delayMs;
            logger_1.logger.bot(`Bot entered as ${bot.username}`);
        });
        bot.on('kicked', reason => {
            logger_1.logger.error(`Bot was kicked: ${reason}`);
        });
        bot.on('error', error => {
            if (this.isRepeatedError(error.message))
                return;
            logger_1.logger.error(error.message);
        });
        bot.once('end', reason => {
            logger_1.logger.bot(`Bot disconnected ${reason ?? 'without reason'}`);
            if (this.bot === bot)
                this.bot = null;
            this.scheduleReconnect();
        });
    }
    scheduleReconnect() {
        if (this.stopped || !this.config.reconnect.enabled || this.reconnectTimer)
            return;
        const delay = this.nextDelayMs;
        this.nextDelayMs = Math.min(delay * 2, this.config.reconnect.maxDelayMs);
        logger_1.logger.bot(`Reconnecting in ${delay} ms`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.start();
        }, delay);
    }
    clearReconnectTimer() {
        if (!this.reconnectTimer)
            return;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
    }
    isRepeatedError(message) {
        const now = Date.now();
        const repeated = this.lastError === message && now - this.lastErrorAt < 1000;
        this.lastError = message;
        this.lastErrorAt = now;
        return repeated;
    }
}
exports.BotManager = BotManager;
