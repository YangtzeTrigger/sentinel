require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('clientReady', async () => {
  const guild = client.guilds.cache.first();
  await guild.channels.fetch();

  const channel = guild.channels.cache.find(c =>
    c.name === 'frontier-beacon' && c.isTextBased()
  ) || guild.channels.cache.find(c => c.isTextBased());

  const invite = await channel.createInvite({ maxAge: 0, maxUses: 0, unique: false });
  console.log(invite.url);
  process.exit(0);
});

client.login(process.env.DISCORD_TOKEN);
