const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on('ready', () => {
  console.log(`Bot active as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!beg') {
    const coins = Math.floor(Math.random() * 100) + 1;
    message.reply(`You begged and received **${coins}** coins! 🪙`);
  }
});

client.login(process.env.TOKEN);
