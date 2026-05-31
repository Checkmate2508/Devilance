"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const manager_1 = require("./manager");
const prompt_1 = require("./prompt");
async function main() {
    const config = await (0, prompt_1.applyStartupPrompts)((0, config_1.loadConfig)());
    const manager = new manager_1.BotManager(config);
    manager.start();
    function shutdown(signal) {
        manager.stop(signal);
        process.exit(0);
    }
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}
void main();
