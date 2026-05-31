"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.config)({ quiet: true });
function booleanValue(defaultValue) {
    return zod_1.z.string().optional().transform(value => {
        if (value === undefined)
            return defaultValue;
        return value.trim().toLowerCase() === 'true';
    });
}
const schema = zod_1.z.object({
    MC_HOST: zod_1.z.string().default('127.0.0.1'),
    MC_PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(25565),
    MC_USERNAME: zod_1.z.string().min(1).default('DevilanceBot'),
    MC_AUTH: zod_1.z.enum(['offline', 'microsoft']).default('offline'),
    MC_VERSION: zod_1.z.string().default('false'),
    BOT_PREFIX: zod_1.z.string().min(1).default('!'),
    ALLOWED_PLAYERS: zod_1.z.string().default('PlayerName'),
    PUBLIC_CHAT_FEEDBACK: booleanValue(false),
    DISABLE_CHAT_FEEDBACK: booleanValue(false),
    RECONNECT: booleanValue(true),
    RECONNECT_DELAY_MS: zod_1.z.coerce.number().int().min(1000).default(5000),
    RECONNECT_MAX_DELAY_MS: zod_1.z.coerce.number().int().min(1000).default(60000),
    VIEWER: booleanValue(false),
    VIEWER_PORT: zod_1.z.coerce.number().int().min(1).max(65535).default(3007)
});
function loadConfig() {
    const env = schema.parse(process.env);
    const feedbackMode = env.DISABLE_CHAT_FEEDBACK ? 'disabled' : env.PUBLIC_CHAT_FEEDBACK ? 'public' : 'private';
    return {
        minecraft: {
            host: env.MC_HOST,
            port: env.MC_PORT,
            username: env.MC_USERNAME,
            auth: env.MC_AUTH,
            version: env.MC_VERSION === 'false' ? undefined : env.MC_VERSION
        },
        bot: {
            prefix: env.BOT_PREFIX,
            allowedPlayers: env.ALLOWED_PLAYERS.split(',').map(player => player.trim()).filter(Boolean),
            feedbackMode
        },
        reconnect: {
            enabled: env.RECONNECT,
            delayMs: env.RECONNECT_DELAY_MS,
            maxDelayMs: env.RECONNECT_MAX_DELAY_MS
        },
        viewer: {
            enabled: env.VIEWER,
            port: env.VIEWER_PORT
        }
    };
}
