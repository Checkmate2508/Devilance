# Devilance 1.0.0.

Minecraft bot base built with Node, TypeScript, and Mineflayer

## What It Does

- Connects a Mineflayer bot to a local Java Edition server
- Uses private feedback by default
- Restricts commands to allowed player names
- Reconnects with backoff when enabled
- Loads movement, collection, auto eat, armor, viewer, and state machine tooling

## Requirements

- Node 22 or newer
- npm
- A Minecraft Java Edition server
- `online-mode=false` when using `MC_AUTH=offline`

## Install

```bash
npm install
```

## Configure

Create your local environment file

```bash
copy .env.example .env
```

Main options

```env
MC_HOST=127.0.0.1
MC_PORT=25565
MC_USERNAME=DevilanceBot
MC_AUTH=offline
MC_VERSION=false
BOT_PREFIX=!
ALLOWED_PLAYERS=YourPlayerName
PUBLIC_CHAT_FEEDBACK=false
DISABLE_CHAT_FEEDBACK=false
RECONNECT=true
VIEWER=false
VIEWER_PORT=3007
```

The startup prompts can override these values before the bot connects

- Allowed players
- Bot connection port
- Public chat feedback Y/N
- Disable chat feedback Y/N

## Run

Development mode

```bash
npm run dev
```

Compiled mode

```bash
npm run build
npm start
```

Type check only

```bash
npm run check
```

## Commands

Only allowed players can use commands

`!come`

Moves the bot near the command sender

`!speak message`

Makes the bot say `message` in public chat

`!flood message`

Makes the bot repeat `message` in public chat at a conservative interval

`!flood stop`

Stops the active flood loop

`!follow player`

Makes the bot follow a visible player

`!follow me`

Makes the bot follow the command sender

## Feedback

Private feedback is enabled by default

Set `PUBLIC_CHAT_FEEDBACK=true` to send feedback in public chat

Set `DISABLE_CHAT_FEEDBACK=true` to silence command feedback

`!speak` and `!flood` always use public chat because that is the command action

## Viewer

Enable the browser viewer in `.env`

```env
VIEWER=true
VIEWER_PORT=3007
```

Start the bot and open this address

```text
http://localhost:3007
```

If the viewer reports a missing `canvas` package, install the native dependency

```bash
npm install canvas
```

## Notes

- Keep the Minecraft server running before starting the bot
- Use `RECONNECT=false` while testing startup failures
- Console output is limited to `[BOT]` status lines and `[ERROR]` error lines

## Future Plans

- Add support for using the bot on multiplayer servers
- Add more advanced commands
- Add bot profile customization
- Add connection modes for local servers, offline Minecraft, and Microsoft accounts
