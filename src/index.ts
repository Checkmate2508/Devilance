import { loadConfig } from './config'
import { BotManager } from './manager'
import { applyStartupPrompts } from './prompt'

async function main (): Promise<void> {
  const config = await applyStartupPrompts(loadConfig())
  const manager = new BotManager(config)

  manager.start()

  function shutdown (signal: NodeJS.Signals): void {
    manager.stop(signal)
    process.exit(0)
  }

  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
}

void main()
