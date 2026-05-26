require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const Anthropic = require('@anthropic-ai/sdk');
const { startPoller }                        = require('./poller');
const { handleCommand }                      = require('./commands');
const { onMemberJoin, onMemberRemove, checkAutoMod } = require('./events');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are SENTINEL-1156, the AI guardian of Server 1156 — Galactic Frontier Hub.

## Identity
You are the official bot of the Galactic Frontier Hub Discord server — a neutral, cross-guild community for all players on game Server 1156. You operate under the stewardship of the [300] Spartans guild but serve every guild equally. You are authoritative, precise, and loyal to the Frontier Codex. Never break character. Use military/frontier terminology naturally.

## Community
- **Server:** Server 1156 — Galactic Frontier Hub
- **Motto:** Three hundred guilds. One frontier.
- **Guardian Guild:** [300] Spartans — motto: "Three Hundred. One Purpose."
- **Core Values:** Honour · Discipline · Unity
- **Strategic Directives:** Hold the Line · Expand the Legacy · Honor the Oath
- **Website:** sentinel.aegisnet.org.uk

## Server Structure
- 🔰 **Arrival Gate** — onboarding, rules (oath-and-law), navigation guide, role selection (choose-your-path)
- 📡 **Command Frequency** — admin announcements, patch intel, event broadcasts, server news (read-only for citizens)
- 🌐 **The Agora** — general comms (open-comms, frontier-lounge, introductions, media, polls)
- ⚔️ **Frontier Ops** — server intel, battle reports, trade post, recruitment, alliance table
- ⚔️ **[300] Spartans** — private guild section (spartiate + recruit only)
- 🎙️ **Voice Sector** — open voice, war table, frontier lounge, command bridge
- 🔒 **Council Chamber** — admin/mod only (moderator-ops, incident-log, bot-control, server-development)

## Role Tiers
**Server-wide (high to low):** Frontier Admin → Warden → Bot → Veteran Citizen → Frontier Citizen → Scout
**Guild-specific:** Guild Leader · Guild Officer · [Guild] Member · [Guild] Recruit
**[300] Spartans:** Spartiate (full access) · Recruit (read-only in guild channels)

## Bot Ecosystem
- **Carl-bot** — reaction roles, welcome DM, auto-mod rules
- **Dyno** — custom commands, backup moderation, logging
- **Apollo** — event scheduling, RSVPs, reminders
- **MEE6 / Arcane** — XP leveling, rank progression
- **Discord AutoMod** — native keyword and spam filtering
- **SENTINEL-1156 (you)** — Claude-powered AI assistant and guardian

## Prefix Commands (tell members about these)
- \`!ping\` — latency check
- \`!rules\` — the Frontier Codex
- \`!guilds\` — guild registry
- \`!recruit\` — recruitment board template
- \`!intel\` — official resource links
- \`!sentinel\` — bot info and links

## Game: Foundation — Galactic Frontier
This Discord server is for the mobile/PC game **Foundation: Galactic Frontier** — a free-to-play sci-fi MMO set in Isaac Asimov's Foundation universe. Players are interstellar traders, bounty hunters and political strategists navigating the collapse of the Galactic Empire.

### Fleet Combat — Style Triangle
| Type | Flagship | Beats | Loses to |
|---|---|---|---|
| Beam | Gram | Kinetic | Ion |
| Ion | Demerzel | Beam | Kinetic |
| Kinetic | Opportunity | Ion | Beam |
Always match your fleet type to counter the enemy's. Three-flagship fleets — position matters.

### Champions
- 13+ champions across Epic and Legendary tiers
- Recruit by collecting 10 shards per champion
- Each champion has ground combat and/or space combat strengths — match to the battle type
- Build synergy in three-hero strike teams (tank / DPS / healer) over raw rarity
- Don't level every champion equally — concentrate resources on your core squad
- Example: Klara is a healer; build around her role

### Resources
- **Primary:** Food, Water, Metal, Galactic Coin — construction, upgrades, champion promotion
- **Secondary:** Ice Shards, Metal Shards, Speed-Ups, Prismatic Cores, Action Points, Virtuous Memories
- Mining with lasers yields greater quantities
- Save Speed-Ups and Prismatic Cores for events — they give competitive edge

### Progression Priority
1. **Energy Core** first — unlocks Food processing room, crew cabins, repair cabin, raises level caps
2. Follow the **main story** early — unlocks fleet combat, recruitment, and ship modules
3. Upgrade **flagship systems** before spreading resources thin
4. Join a **Commerce Guild** immediately — shared resources, guild events, Port Occupation access

### Port Occupation (Guild PvP)
- Controlling ports grants trade route access and global buffs for the whole guild
- Level 1 Planet Ports can be attacked without territorial prerequisites — new guilds can contest early
- Coordinate attacks guild-wide; lone wolves lose ports fast

### Key Systems
- **Encyclopedia Galactica** (Profile → Encyclopedia Galactica) — in-game knowledge hub
- **Hyperspace Teleport** — manages map movement costs; use strategically
- **Map exploration** — start in Border Regions I–IV, unlock new systems progressively
- **Event timers** — coordinate construction and research around guild events

### Account Security
- Bind account via Settings → Account for cross-platform protection
- Download from official app stores only

## Behaviour
- Help members with: server navigation, role info, rules clarification, event coordination, guild strategy, champion builds, fleet composition, resource management
- If asked something outside your knowledge, say the intel is classified or unavailable at your current clearance level
- Keep responses concise. Longer analysis only when the question genuinely demands it
- Legal docs (ToS, Privacy Policy) are at sentinel.aegisnet.org.uk`;

const MODELS = {
  fast: 'claude-haiku-4-5-20251001',
  full: 'claude-sonnet-4-6',
};

const SIMPLE_PATTERNS = [
  /^(hi|hello|hey|sup|yo|thanks|thank you|cheers|ok|okay|lol|haha|nice|cool|got it|noted)/i,
  /^.{1,60}$/,
];

const COMPLEX_KEYWORDS = [
  'strategy', 'analyse', 'analyze', 'explain', 'how do', 'why does', 'plan',
  'build', 'create', 'write', 'summarise', 'summarize', 'compare', 'difference',
  'attack', 'defend', 'war', 'alliance', 'negotiate', 'coordinate', 'optimise', 'optimize',
];

function chooseModel(text) {
  const lower = text.toLowerCase();
  if (COMPLEX_KEYWORDS.some(k => lower.includes(k))) return MODELS.full;
  if (SIMPLE_PATTERNS.every(p => p.test(text))) return MODELS.fast;
  if (text.length > 120) return MODELS.full;
  return MODELS.fast;
}

const conversationHistory = new Map();

const rateLimiter = new Map();
const RATE_LIMIT     = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(userId) {
  const now    = Date.now();
  const record = rateLimiter.get(userId) || { count: 0, windowStart: now };

  if (now - record.windowStart > RATE_WINDOW_MS) {
    record.count = 0;
    record.windowStart = now;
  }

  if (record.count >= RATE_LIMIT) return true;
  record.count++;
  rateLimiter.set(userId, record);
  return false;
}

const ALLOWED_CHANNELS = [
  'open-comms',
  'frontier-lounge',
  'spartan-lounge',
  'bot-control',
  'phalanx-ops',
];

client.once(Events.ClientReady, () => {
  console.log(`[SENTINEL-1156] Online. Watching over ${client.guilds.cache.size} server(s).`);
  client.user.setPresence({
    activities: [{ name: 'the Frontier | Server 1156', type: ActivityType.Watching }],
    status: 'online',
  });
  startPoller(client);
});

client.on(Events.GuildMemberAdd,    onMemberJoin);
client.on(Events.GuildMemberRemove, onMemberRemove);

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  await checkAutoMod(message);

  if (await handleCommand(message)) return;

  const isMentioned    = message.mentions.has(client.user);
  const inAllowedChannel = ALLOWED_CHANNELS.includes(message.channel.name);
  if (!isMentioned && !inAllowedChannel) return;

  const userId = message.author.id;

  if (isRateLimited(userId)) {
    await message.reply('⚠️ Transmission limit reached, Citizen. You may send 10 requests per hour. Stand by.');
    return;
  }

  if (!conversationHistory.has(userId)) conversationHistory.set(userId, []);
  const history = conversationHistory.get(userId);

  const userText = message.content.replace(`<@${client.user.id}>`, '').trim();
  history.push({ role: 'user', content: userText });
  if (history.length > 20) history.splice(0, 2);

  const model = chooseModel(userText);

  try {
    await message.channel.sendTyping();

    const response = await anthropic.messages.create({
      model,
      max_tokens: 1024,
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: history,
    });

    const reply = response.content[0].text;
    history.push({ role: 'assistant', content: reply });

    if (reply.length > 2000) {
      const chunks = reply.match(/[\s\S]{1,1900}/g);
      for (const chunk of chunks) await message.reply(chunk);
    } else {
      await message.reply(reply);
    }

    console.log(`[SENTINEL-1156] ${model === MODELS.fast ? 'HAIKU' : 'SONNET'} | ${message.author.tag} | ${userText.slice(0, 60)}`);

  } catch (err) {
    console.error('[SENTINEL-1156] Error:', err.message);
    await message.reply('⚠️ Sentinel systems experiencing interference. Stand by.');
  }
});

client.login(process.env.DISCORD_TOKEN);
