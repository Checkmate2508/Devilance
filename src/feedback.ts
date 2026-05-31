import type { Bot } from 'mineflayer'
import type { FeedbackMode } from './config'

export function sendFeedback (bot: Bot, username: string, mode: FeedbackMode, message: string): void {
  if (mode === 'disabled') return
  if (mode === 'public') {
    bot.chat(message)
    return
  }

  bot.whisper(username, message)
}
