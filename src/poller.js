const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const LAST_SEEN_PATH = path.join(__dirname, '../data/last-seen.json');
const PATCH_CHANNEL = 'patch-intel';
const STEAM_APP_ID = '4223760';
const STEAM_NEWS_URL = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${STEAM_APP_ID}&count=5&maxlength=800&format=json`;
const OFFICIAL_NEWS_URL = 'https://www.foundation.game/en/news';

function loadLastSeen() {
  try {
    return JSON.parse(fs.readFileSync(LAST_SEEN_PATH, 'utf8'));
  } catch {
    return { steam: { lastGid: null }, official: { lastTitle: null } };
  }
}

function saveLastSeen(data) {
  fs.writeFileSync(LAST_SEEN_PATH, JSON.stringify(data, null, 2));
}

async function fetchSteamNews() {
  try {
    const res = await fetch(STEAM_NEWS_URL);
    const json = await res.json();
    return json?.appnews?.newsitems || [];
  } catch (err) {
    console.error('[POLLER] Steam fetch error:', err.message);
    return [];
  }
}

async function fetchOfficialNews() {
  try {
    const res = await fetch(OFFICIAL_NEWS_URL);
    const html = await res.text();
    const matches = [...html.matchAll(/<h[23][^>]*>([^<]{10,})<\/h[23]>/gi)];
    return matches.map(m => m[1].trim()).filter(t => t.length > 0).slice(0, 5);
  } catch (err) {
    console.error('[POLLER] Official site fetch error:', err.message);
    return [];
  }
}

function getPatchChannel(client) {
  for (const guild of client.guilds.cache.values()) {
    const ch = guild.channels.cache.find(
      c => c.name === PATCH_CHANNEL && c.isTextBased()
    );
    if (ch) return ch;
  }
  return null;
}

function formatSteamPost(item) {
  const date = new Date(item.date * 1000).toDateString();
  const body = item.contents
    .replace(/<[^>]+>/g, '')
    .replace(/\{[^}]+\}/g, '')
    .trim()
    .slice(0, 600);
  return [
    `📡 **FRONTIER DISPATCH — ${date}**`,
    `**${item.title}**`,
    '',
    body + (body.length >= 600 ? '…' : ''),
    '',
    `🔗 <${item.url}>`,
  ].join('\n');
}

async function poll(client) {
  const seen = loadLastSeen();
  const channel = getPatchChannel(client);
  if (!channel) return;

  const items = await fetchSteamNews();
  if (items.length > 0) {
    const latest = items[0];
    if (latest.gid !== seen.steam.lastGid) {
      const newItems = seen.steam.lastGid
        ? items.filter(i => i.gid !== seen.steam.lastGid)
        : [latest];
      for (const item of newItems.reverse()) {
        await channel.send(formatSteamPost(item));
      }
      seen.steam.lastGid = latest.gid;
      saveLastSeen(seen);
    }
  }

  const headlines = await fetchOfficialNews();
  if (headlines.length > 0 && headlines[0] !== seen.official.lastTitle) {
    if (seen.official.lastTitle !== null) {
      const newHeadlines = headlines.slice(
        0,
        headlines.indexOf(seen.official.lastTitle)
      ).filter((_, i) => i < 3);
      for (const h of newHeadlines.reverse()) {
        await channel.send(
          `📰 **NEW FROM FRONTIER COMMAND**\n${h}\n\n🔗 <${OFFICIAL_NEWS_URL}>`
        );
      }
    }
    seen.official.lastTitle = headlines[0];
    saveLastSeen(seen);
  }
}

function startPoller(client) {
  console.log('[POLLER] Update scanner online. Checking every hour.');
  poll(client);
  cron.schedule('0 * * * *', () => poll(client));
}

module.exports = { startPoller };
