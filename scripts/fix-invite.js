require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const INVITE = 'https://discord.gg/Dkut7cG2SZ';

const NEW_CONTENT = `🌌 WELCOME TO SERVER 1156 — GALACTIC FRONTIER HUB

This is the neutral ground for all guilds of Server 1156. Foundation: Galactic Frontier spans hundreds of guilds, alliances, and factions across our server — and every one of them has a home here. We are not aligned with any single guild. We are the frontier itself.

This hub exists so players can connect across guild lines — trading intelligence, coordinating events, building alliances, and sharing the experience of carving out an empire in the galaxy. Whether you're a veteran Spartiate, a fresh Scout still finding your feet, or a Guild Leader looking to expand your reach, this server is your neutral territory.

All guilds are welcome to claim a district. Bring your colours, your members, and your ambitions — the frontier is vast enough for all. Head to #choose-your-path to receive your role and begin your journey.

🔗 Discord Invite: ${INVITE}
🌐 Web: https://sentinel.aegisnet.org.uk

*Three hundred guilds. One frontier.*`;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', async () => {
  const guild = client.guilds.cache.first();
  await guild.channels.fetch();

  const channel = guild.channels.cache.find(c => c.name === 'frontier-beacon' && c.isTextBased());
  if (!channel) { console.error('Channel not found'); process.exit(1); }

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMsg = messages.find(m => m.author.id === client.user.id && m.content.includes('INVITE_LINK_HERE'));
  if (botMsg) {
    await botMsg.edit(NEW_CONTENT);
    console.log('✓ Updated existing message in #frontier-beacon');
  } else {
    const msg = await channel.send(NEW_CONTENT);
    await msg.pin().catch(() => {});
    console.log('✓ Posted new message to #frontier-beacon');
  }

  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
