# Sentinel — Discord Admin Bot

## Project Overview
Discord admin bot built with discord.js (Node.js). Intended to include Claude/Anthropic AI integration.

## Stack
- Runtime: Node.js v24
- Framework: discord.js + @discordjs/rest + discord-api-types
- AI: Anthropic SDK (key stored in .env)
- Config: dotenv

## Environment Variables
Copy `.env.example` to `.env` and populate:
- `DISCORD_TOKEN` — Discord bot token
- `CLIENT_ID` — Discord application/client ID
- `GUILD_ID` — Target guild/server ID
- `ANTHROPIC_API_KEY` — Anthropic API key

## Status
- [x] npm project initialized
- [x] discord.js and dependencies installed
- [x] .env.example created
- [x] .env populated (DISCORD_TOKEN, APPLICATION_ID, ANTHROPIC_API_KEY)
- [x] Bot entry point (src/index.js) — Claude-powered chat bot, model routing, rate limiting, conversation history
- [x] Server setup script (src/setup.js) — roles, channel structure, permission overwrites
- [x] Git repo initialized
- [ ] Slash commands not yet added

## Notes
- Always read this CLAUDE.md before touching any file
- Commit after every meaningful feature addition
- Bot type: admin/moderation bot
