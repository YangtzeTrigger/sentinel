require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client, GatewayIntentBits, PermissionFlagsBits, ChannelType } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

const ROLES = [
  { name: '⚡ Frontier Admin',   color: 0xF59E0B, hoist: true,  position: 10 },
  { name: '🛡️ Warden',           color: 0x3B82F6, hoist: true,  position: 9  },
  { name: '🤖 Bot',              color: 0x374151, hoist: false, position: 8  },
  { name: '🌟 Veteran Citizen',  color: 0x94A3B8, hoist: true,  position: 7  },
  { name: '⚔️ Frontier Citizen', color: 0xE2E8F0, hoist: false, position: 6  },
  { name: '👁️ Scout',            color: 0x64748B, hoist: false, position: 5  },
  { name: '[300] Spartiate',     color: 0xD4AF37, hoist: true,  position: 4  },
  { name: '[300] Recruit',       color: 0xB8960C, hoist: false, position: 3  },
  { name: 'Guild Leader',        color: 0xFFFFFF, hoist: false, position: 2  },
  { name: 'Guild Officer',       color: 0xCCCCCC, hoist: false, position: 1  },
];

const STRUCTURE = [
  {
    name: '🔰 ― ARRIVAL GATE ―',
    type: 'category',
    channels: [
      { name: 'frontier-beacon',  type: ChannelType.GuildText },
      { name: 'oath-and-law',     type: ChannelType.GuildText },
      { name: 'how-to-navigate',  type: ChannelType.GuildText },
      { name: 'choose-your-path', type: ChannelType.GuildText },
    ]
  },
  {
    name: '📡 ― COMMAND FREQUENCY ―',
    type: 'category',
    channels: [
      { name: 'high-command-dispatch', type: ChannelType.GuildText },
      { name: 'patch-intel',           type: ChannelType.GuildText },
      { name: 'event-broadcasts',      type: ChannelType.GuildText },
      { name: 'server-1156-news',      type: ChannelType.GuildText },
    ]
  },
  {
    name: '🌐 ― THE AGORA ―',
    type: 'category',
    channels: [
      { name: 'open-comms',    type: ChannelType.GuildText },
      { name: 'frontier-lounge', type: ChannelType.GuildText },
      { name: 'introductions', type: ChannelType.GuildText },
      { name: 'media-uplink',  type: ChannelType.GuildText },
      { name: 'poll-station',  type: ChannelType.GuildText },
    ]
  },
  {
    name: '⚔️ ― FRONTIER OPS ―',
    type: 'category',
    channels: [
      { name: 'server-1156-intel',  type: ChannelType.GuildText },
      { name: 'battle-reports',     type: ChannelType.GuildText },
      { name: 'trade-post',         type: ChannelType.GuildText },
      { name: 'recruitment-board',  type: ChannelType.GuildText },
      { name: 'alliance-table',     type: ChannelType.GuildText },
    ]
  },
  {
    name: '⚔️ [300] SPARTANS',
    type: 'category',
    guildRole: '[300] Spartiate',
    recruitRole: '[300] Recruit',
    channels: [
      { name: 'spartan-command',  type: ChannelType.GuildText },
      { name: 'phalanx-ops',     type: ChannelType.GuildText },
      { name: 'spartan-lounge',  type: ChannelType.GuildText },
      { name: 'war-room',        type: ChannelType.GuildText },
      { name: 'Spartiate Voice', type: ChannelType.GuildVoice },
    ]
  },
  {
    name: '🎙️ ― VOICE SECTOR ―',
    type: 'category',
    channels: [
      { name: 'Open Comms',      type: ChannelType.GuildVoice },
      { name: 'War Table',       type: ChannelType.GuildVoice },
      { name: 'Frontier Lounge', type: ChannelType.GuildVoice },
      { name: 'Command Bridge',  type: ChannelType.GuildVoice, adminOnly: true },
    ]
  },
  {
    name: '🔒 ― COUNCIL CHAMBER ―',
    type: 'category',
    adminOnly: true,
    channels: [
      { name: 'moderator-ops',     type: ChannelType.GuildText },
      { name: 'incident-log',      type: ChannelType.GuildText },
      { name: 'bot-control',       type: ChannelType.GuildText },
      { name: 'server-development', type: ChannelType.GuildText },
    ]
  },
];

function log(msg) {
  console.log(`[SENTINEL-1156] ${msg}`);
}

async function deleteDefaultChannels(guild) {
  log('Deleting default channels...');
  const channels = await guild.channels.fetch();
  for (const [, channel] of channels) {
    try {
      await channel.delete();
      log(`  Deleted: #${channel.name}`);
    } catch {}
  }
}

async function createRoles(guild) {
  log('Creating roles...');
  const created = {};
  for (const role of ROLES) {
    const existing = guild.roles.cache.find(r => r.name === role.name);
    if (existing) {
      created[role.name] = existing;
      log(`  Exists: ${role.name}`);
      continue;
    }
    const r = await guild.roles.create({
      name: role.name,
      color: role.color,
      hoist: role.hoist,
      reason: 'SENTINEL-1156 setup'
    });
    created[role.name] = r;
    log(`  Created: ${role.name}`);
  }
  return created;
}

async function buildStructure(guild, roles) {
  log('Building channel structure...');

  const everyoneRole = guild.roles.everyone;
  const adminRole    = roles['⚡ Frontier Admin'];
  const wardenRole   = roles['🛡️ Warden'];
  const citizenRole  = roles['⚔️ Frontier Citizen'];
  const scoutRole    = roles['👁️ Scout'];

  const DENY_ALL  = { [PermissionFlagsBits.ViewChannel]: false };
  const ALLOW_ALL = { [PermissionFlagsBits.ViewChannel]: true, [PermissionFlagsBits.SendMessages]: true };
  const READ_ONLY = { [PermissionFlagsBits.ViewChannel]: true, [PermissionFlagsBits.SendMessages]: false };

  for (const section of STRUCTURE) {
    let permissionOverwrites = [];

    if (section.adminOnly) {
      permissionOverwrites = [
        { id: everyoneRole, deny: [PermissionFlagsBits.ViewChannel] },
        { id: adminRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: wardenRole,   allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ];
    } else if (section.guildRole) {
      const guildRole   = roles[section.guildRole];
      const recruitRole = roles[section.recruitRole];
      permissionOverwrites = [
        { id: everyoneRole, deny:  [PermissionFlagsBits.ViewChannel] },
        { id: scoutRole,    deny:  [PermissionFlagsBits.ViewChannel] },
        { id: citizenRole,  deny:  [PermissionFlagsBits.ViewChannel] },
        { id: guildRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: recruitRole,  allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        { id: adminRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: wardenRole,   allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ];
    } else if (section.name.includes('ARRIVAL GATE')) {
      permissionOverwrites = [
        { id: everyoneRole, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        { id: scoutRole,    allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        { id: citizenRole,  allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
      ];
    } else if (section.name.includes('COMMAND FREQUENCY')) {
      permissionOverwrites = [
        { id: everyoneRole, deny:  [PermissionFlagsBits.ViewChannel] },
        { id: scoutRole,    deny:  [PermissionFlagsBits.ViewChannel] },
        { id: citizenRole,  allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
        { id: adminRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ];
    } else {
      permissionOverwrites = [
        { id: everyoneRole, deny:  [PermissionFlagsBits.ViewChannel] },
        { id: scoutRole,    deny:  [PermissionFlagsBits.ViewChannel] },
        { id: citizenRole,  allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: adminRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        { id: wardenRole,   allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
      ];
    }

    const category = await guild.channels.create({
      name: section.name,
      type: ChannelType.GuildCategory,
      permissionOverwrites,
      reason: 'SENTINEL-1156 setup'
    });
    log(`  Category: ${section.name}`);

    for (const ch of section.channels) {
      let chOverwrites = [...permissionOverwrites];

      if (ch.name === 'choose-your-path') {
        chOverwrites = [
          { id: everyoneRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: scoutRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ];
      }

      if (ch.adminOnly) {
        chOverwrites = [
          { id: everyoneRole, deny:  [PermissionFlagsBits.ViewChannel] },
          { id: adminRole,    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          { id: wardenRole,   allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
        ];
      }

      await guild.channels.create({
        name: ch.name,
        type: ch.type,
        parent: category.id,
        permissionOverwrites: chOverwrites,
        reason: 'SENTINEL-1156 setup'
      });
      log(`    Channel: #${ch.name}`);
    }
  }
}

client.once('ready', async () => {
  log(`Logged in as ${client.user.tag}`);
  const guild = client.guilds.cache.first();
  if (!guild) { log('ERROR: Bot is not in any server.'); process.exit(1); }
  log(`Target server: ${guild.name}`);

  await deleteDefaultChannels(guild);
  const roles = await createRoles(guild);
  await buildStructure(guild, roles);

  log('');
  log('✅ Setup complete! SENTINEL-1156 has built Server 1156 — Galactic Frontier Hub.');
  log('Next steps:');
  log('  1. Assign yourself ⚡ Frontier Admin in Discord');
  log('  2. Install Carl-bot, Dyno, Apollo, MEE6/Arcane');
  log('  3. Run: npm start  (to launch the Claude-powered bot)');
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
