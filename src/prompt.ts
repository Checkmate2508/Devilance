import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import type { AppConfig, FeedbackMode } from './config'

export async function applyStartupPrompts (config: AppConfig): Promise<AppConfig> {
  if (!input.isTTY) return config

  clearTerminal()
  const reader = createInterface({ input, output })

  try {
    const allowedPlayers = parsePlayers(await ask(reader, 'Allowed players', config.bot.allowedPlayers.join(', ')))
    const portAnswer = await ask(reader, 'Bot connection port', String(config.minecraft.port))
    const publicFeedback = parseYesNo(await ask(reader, 'Public chat feedback Y/N', 'N'))
    const disabledFeedback = parseYesNo(await ask(reader, 'Disable chat feedback Y/N', 'N'))

    const feedbackMode: FeedbackMode = disabledFeedback ? 'disabled' : publicFeedback ? 'public' : 'private'

    return {
      ...config,
      minecraft: {
        ...config.minecraft,
        port: Number.parseInt(portAnswer, 10) || config.minecraft.port
      },
      bot: {
        ...config.bot,
        allowedPlayers,
        feedbackMode
      }
    }
  } finally {
    reader.close()
  }
}

async function ask (reader: ReturnType<typeof createInterface>, label: string, fallback: string): Promise<string> {
  const answer = await reader.question(`${label} (${fallback}): `)
  return answer.trim() || fallback
}

function parsePlayers (value: string): string[] {
  return value.split(',').map(player => player.trim()).filter(Boolean)
}

function parseYesNo (value: string): boolean {
  return value.trim().toLowerCase().startsWith('y')
}

function clearTerminal (): void {
  output.write('\x1b[2J\x1b[3J\x1b[H')
}
