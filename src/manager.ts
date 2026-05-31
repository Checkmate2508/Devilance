import type { Bot } from 'mineflayer'
import type { AppConfig } from './config'
import { createBot } from './bot'
import { logger } from './logger'

export class BotManager {
  private bot: Bot | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private stopped = true
  private nextDelayMs: number
  private lastError = ''
  private lastErrorAt = 0

  constructor (private readonly config: AppConfig) {
    this.nextDelayMs = config.reconnect.delayMs
  }

  start (): Bot | null {
    if (this.bot) return this.bot

    this.stopped = false
    this.clearReconnectTimer()
    logger.bot(`Connecting to ${this.config.minecraft.host}:${this.config.minecraft.port}`)

    try {
      this.bot = createBot(this.config)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error(`Failed to create bot: ${message}`)
      this.scheduleReconnect()
      return null
    }

    this.bindEvents(this.bot)
    return this.bot
  }

  stop (reason = 'Stopped manually'): void {
    this.stopped = true
    this.clearReconnectTimer()

    const bot = this.bot
    this.bot = null

    if (bot) {
      bot.clearControlStates?.()
      bot.end(reason)
    }
  }

  getBot (): Bot | null {
    return this.bot
  }

  private bindEvents (bot: Bot): void {
    bot.once('spawn', () => {
      this.nextDelayMs = this.config.reconnect.delayMs
      logger.bot(`Bot entered as ${bot.username}`)
    })

    bot.on('kicked', reason => {
      logger.error(`Bot was kicked: ${reason}`)
    })

    bot.on('error', error => {
      if (this.isRepeatedError(error.message)) return
      logger.error(error.message)
    })

    bot.once('end', reason => {
      logger.bot(`Bot disconnected ${reason ?? 'without reason'}`)
      if (this.bot === bot) this.bot = null
      this.scheduleReconnect()
    })
  }

  private scheduleReconnect (): void {
    if (this.stopped || !this.config.reconnect.enabled || this.reconnectTimer) return

    const delay = this.nextDelayMs
    this.nextDelayMs = Math.min(delay * 2, this.config.reconnect.maxDelayMs)

    logger.bot(`Reconnecting in ${delay} ms`)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.start()
    }, delay)
  }

  private clearReconnectTimer (): void {
    if (!this.reconnectTimer) return

    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private isRepeatedError (message: string): boolean {
    const now = Date.now()
    const repeated = this.lastError === message && now - this.lastErrorAt < 1000
    this.lastError = message
    this.lastErrorAt = now
    return repeated
  }
}
