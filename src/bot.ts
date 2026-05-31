import mineflayer, { type Bot, type BotOptions } from 'mineflayer'
import armorManager from 'mineflayer-armor-manager'
import { pathfinder } from 'mineflayer-pathfinder'
import { globalSettings } from 'mineflayer-statemachine'
import type { AppConfig } from './config'
import { loadCommands } from './commands'
import { logger } from './logger'

export function createBot (config: AppConfig): Bot {
  const options: BotOptions = {
    host: config.minecraft.host,
    port: config.minecraft.port,
    username: config.minecraft.username,
    auth: config.minecraft.auth,
    version: config.minecraft.version,
    viewDistance: 'tiny',
    logErrors: false
  }

  const bot = mineflayer.createBot(options)
  globalSettings.debugMode = false

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(armorManager)
  loadCommands(bot, config)

  const autoEatReady = import('mineflayer-auto-eat')
    .then(({ loader }) => {
      bot.loadPlugin(loader)
    })
    .catch(error => {
      logger.error(`Auto eat failed to load: ${error.message}`)
    })

  bot.once('spawn', async () => {
    await autoEatReady
    if (bot.autoEat) {
      bot.autoEat.setOpts({
        minHunger: 16,
        minHealth: 14,
        returnToLastItem: true
      })
      bot.autoEat.enableAuto()
    }

    void bot.armorManager.equipAll().catch(error => {
      logger.error(`Armor manager failed: ${error.message}`)
    })
  })

  if (config.viewer.enabled) {
    bot.once('spawn', async () => {
      try {
        const { mineflayer: viewer } = await import('prismarine-viewer')
        viewer(bot, { port: config.viewer.port, firstPerson: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        logger.error(`Viewer failed to load: ${message}`)
      }
    })
  }

  return bot
}
