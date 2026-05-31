export const logger = {
  bot (message: string): void {
    console.log(`[BOT] ${message}`)
  },

  error (message: string): void {
    console.error(`[ERROR] ${message}`)
  }
}
