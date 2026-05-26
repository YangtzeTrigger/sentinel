const { EmbedBuilder } = require('discord.js');

const GOLD     = 0xD4AF37;
const GREY     = 0x64748B;
const FOOTER   = 'Sentinel-1156 | Guardian of the Frontier';
const LOG_CH   = 'incident-log';
const MOD_CH   = 'moderator-ops';
const SCOUT    = '👁️ Scout';
const INVITE_RE = /(discord\.gg\/|discord\.com\/invite\/)/i;
const SPAM_WINDOW = 10_000;
const SPAM_LIMIT  = 5;

const spamTracker = new Map();

function embed(title, description, color = GOLD) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function getChannel(guild, name) {
  return guild.channels.cache.find(c => c.name === name && c.isTextBased());
}

async function onMemberJoin(member) {
  try {
    await member.send(
      `**Welcome to Server 1156 — Galactic Frontier Hub, ${member.user.username}.**\n\n` +
      `Head to **#choose-your-path** to get your role and access the frontier.\n` +
      `Rules: **#oath-and-law** | Help: **#how-to-navigate**\n\n` +
      `*Three hundred guilds. One purpose.*`
    );
  } catch {
    // Member has DMs disabled — skip silently
  }

  const log = getChannel(member.guild, LOG_CH);
  if (log) {
    await log.send({ embeds: [embed('✅ MEMBER ARRIVED',
      `**${member.user.tag}** has joined the frontier.\nID: \`${member.user.id}\``
    )] });
  }
}

async function onMemberRemove(member) {
  const log = getChannel(member.guild, LOG_CH);
  if (log) {
    await log.send({ embeds: [embed('🚪 MEMBER DEPARTED',
      `**${member.user.tag}** has left the server.\nID: \`${member.user.id}\``,
      GREY
    )] });
  }
}

async function checkAutoMod(message) {
  if (message.author.bot || !message.guild) return;

  const member  = message.member;
  const isScout = member?.roles.cache.some(r => r.name === SCOUT);
  const modLog  = getChannel(message.guild, MOD_CH);

  // Block invite links from Scouts
  if (isScout && INVITE_RE.test(message.content)) {
    await message.delete().catch(() => {});
    await message.channel.send(
      `${message.author} — Frontier Scouts are not authorised to post invite links. ` +
      `Advance your rank to earn that privilege.`
    );
    if (modLog) {
      await modLog.send({ embeds: [embed('🚫 INVITE BLOCKED',
        `**User:** ${message.author.tag} (\`${message.author.id}\`)\n` +
        `**Channel:** #${message.channel.name}\n` +
        `**Content:** \`${message.content.slice(0, 200)}\``
      )] });
    }
    return;
  }

  // Anti-spam: 5+ identical messages within 10 seconds
  const now    = Date.now();
  const userId = message.author.id;
  const record = spamTracker.get(userId) || { content: null, timestamps: [] };

  if (record.content !== message.content) {
    record.content    = message.content;
    record.timestamps = [];
  }

  record.timestamps = record.timestamps.filter(t => now - t < SPAM_WINDOW);
  record.timestamps.push(now);
  spamTracker.set(userId, record);

  if (record.timestamps.length >= SPAM_LIMIT) {
    await message.channel.send(
      `${message.author} — Transmission interference detected. Stand down, Citizen.`
    );
    record.timestamps = [];
    spamTracker.set(userId, record);
    if (modLog) {
      await modLog.send({ embeds: [embed('⚠️ SPAM WARNING',
        `**User:** ${message.author.tag} (\`${message.author.id}\`)\n` +
        `**Channel:** #${message.channel.name}\n` +
        `**Pattern:** ${SPAM_LIMIT}+ identical messages in ${SPAM_WINDOW / 1000}s`
      )] });
    }
  }
}

module.exports = { onMemberJoin, onMemberRemove, checkAutoMod };
