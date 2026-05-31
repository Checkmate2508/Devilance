"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFeedback = sendFeedback;
function sendFeedback(bot, username, mode, message) {
    if (mode === 'disabled')
        return;
    if (mode === 'public') {
        bot.chat(message);
        return;
    }
    bot.whisper(username, message);
}
