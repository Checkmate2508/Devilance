"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    bot(message) {
        console.log(`[BOT] ${message}`);
    },
    error(message) {
        console.error(`[ERROR] ${message}`);
    }
};
