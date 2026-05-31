import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv({ quiet: true })

function booleanValue (defaultValue: boolean) {
  return z.string().optional().transform(value => {
    if (value === undefined) return defaultValue
    return value.trim().toLowerCase() === 'true'
  })
}

const schema = z.object({
  MC_HOST: z.string().default('127.0.0.1'),
  MC_PORT: z.coerce.number().int().min(1).max(65535).default(25565),
  MC_USERNAME: z.string().min(1).default('DevilanceBot'),
  MC_AUTH: z.enum(['offline', 'microsoft']).default('offline'),
  MC_VERSION: z.string().default('false'),
  BOT_PREFIX: z.string().min(1).default('!'),
  ALLOWED_PLAYERS: z.string().default('PlayerName'),
  PUBLIC_CHAT_FEEDBACK: booleanValue(false),
  DISABLE_CHAT_FEEDBACK: booleanValue(false),
  RECONNECT: booleanValue(true),
  RECONNECT_DELAY_MS: z.coerce.number().int().min(1000).default(5000),
  RECONNECT_MAX_DELAY_MS: z.coerce.number().int().min(1000).default(60000),
  VIEWER: booleanValue(false),
  VIEWER_PORT: z.coerce.number().int().min(1).max(65535).default(3007)
})

export type FeedbackMode = 'private' | 'public' | 'disabled'

export interface AppConfig {
  minecraft: {
    host: string
    port: number
    username: string
    auth: 'offline' | 'microsoft'
    version?: string
  }
  bot: {
    prefix: string
    allowedPlayers: string[]
    feedbackMode: FeedbackMode
  }
  reconnect: {
    enabled: boolean
    delayMs: number
    maxDelayMs: number
  }
  viewer: {
    enabled: boolean
    port: number
  }
}

export function loadConfig (): AppConfig {
  const env = schema.parse(process.env)
  const feedbackMode: FeedbackMode = env.DISABLE_CHAT_FEEDBACK ? 'disabled' : env.PUBLIC_CHAT_FEEDBACK ? 'public' : 'private'

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
  }
}
