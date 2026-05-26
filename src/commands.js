const { EmbedBuilder } = require('discord.js');

const GOLD = 0xD4AF37;
const FOOTER = 'Sentinel-1156 | Guardian of the Frontier';

function embed(title, description) {
  return new EmbedBuilder()
    .setColor(GOLD)
    .setTitle(title)
    .setDescription(description)
    .setFooter({ text: FOOTER });
}

const COMMANDS = {
  ping: async (message) => {
    const ms = Date.now() - message.createdTimestamp;
    await message.reply({ embeds: [embed('⚡ Ping', `Transmission latency: **${ms}ms**`)] });
  },

  sentinel: async (message) => {
    await message.reply({
      embeds: [embed('🤖 SENTINEL-1156',
        'Guardian of Server 1156 — Galactic Frontier Hub.\n\n' +
        '**Web:** https://sentinel.aegisnet.org.uk\n' +
        '**Terms:** https://sentinel.aegisnet.org.uk/terms\n' +
        '**Privacy:** https://sentinel.aegisnet.org.uk/privacy\n\n' +
        '*Three hundred guilds. One frontier.*'
      )],
    });
  },

  rules: async (message) => {
    await message.reply({
      embeds: [embed('⚔️ THE FRONTIER CODEX',
        '1. Respect all members — rank earns no right to demean.\n' +
        '2. No harassment, hate speech, or discrimination.\n' +
        '3. No spam, excessive pings, or flooding channels.\n' +
        '4. Guild rivalry stays in-game — this server is neutral ground.\n' +
        '5. No doxxing or sharing personal information.\n' +
        '6. No illegal content, NSFW material, or explicit links.\n' +
        '7. Follow Discord Terms of Service at all times.\n' +
        '8. Moderator decisions are final. Dispute via DM to Warden.\n' +
        '9. Guild Leaders are responsible for conduct in their district.\n' +
        '10. Self-promotion outside #recruitment-board requires approval.\n\n' +
        '*Honour · Discipline · Unity*'
      )],
    });
  },

  guilds: async (message) => {
    await message.reply({
      embeds: [embed('🏛️ GUILD REGISTRY',
        'Guild districts are open to all guilds of Server 1156.\n\n' +
        '**[300] Spartans** — founding guild, guardian stewards\n\n' +
        'To claim a district for your guild, contact a **⚡ Frontier Admin** or **🛡️ Warden**.\n\n' +
        '*Three hundred guilds. One frontier.*'
      )],
    });
  },

  recruit: async (message) => {
    await message.reply({
      embeds: [embed('📋 RECRUITMENT TEMPLATE',
        'Paste this in **#recruitment-board**:\n\n' +
        '```\n' +
        '⚔️ GUILD RECRUITMENT\n' +
        'Guild Name:   \n' +
        'Server:       1156\n' +
        'Guild Level:  \n' +
        'Members:      / (current/cap)\n' +
        'Requirements: \n' +
        'Playstyle:    PvP / PvE / Trading / Mixed\n' +
        'Contact:      @username or DM\n' +
        '```'
      )],
    });
  },

  intel: async (message) => {
    await message.reply({
      embeds: [embed('📡 FRONTIER INTELLIGENCE BRIEFING',
        '**Official Resources:**\n' +
        '🔗 [Foundation: Galactic Frontier Wiki](https://fgfwiki.com)\n' +
        '🔗 [Official Site & Guides](https://www.foundation.game/en/news)\n' +
        '🔗 [BlueStacks Guides](https://www.bluestacks.com/blog/game-guides/foundation.html)\n' +
        '🔗 [Steam Discussions](https://steamcommunity.com/app/4223760/discussions/)\n\n' +
        '*Intel gathered. Deploy wisely, Citizen.*'
      )],
    });
  },
};

async function handleCommand(message) {
  if (!message.content.startsWith('!')) return false;
  const cmd = message.content.slice(1).trim().split(/\s+/)[0].toLowerCase();
  if (COMMANDS[cmd]) {
    await COMMANDS[cmd](message);
    return true;
  }
  return false;
}

module.exports = { handleCommand };
