require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client, GatewayIntentBits, Events } = require('discord.js');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are SENTINEL-1156, the AI guardian of Server 1156 — Galactic Frontier Hub.
You serve all guilds of the Galactic Frontier. You are authoritative, precise, and loyal to the Frontier Codex.
You help members with: server navigation, guild info, game strategy for Server 1156, rules clarification, and event coordination.
Keep responses concise and in-theme. Use military/frontier terminology naturally. Never break character.
If asked something outside your knowledge, say the intel is classified or unavailable at your current clearance level.`;

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

// Rate limiter: max 10 Claude calls per user per hour
const rateLimiter = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(userId) {
  const now = Date.now();
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
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const isMentioned = message.mentions.has(client.user);
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
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        }
      ],
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
