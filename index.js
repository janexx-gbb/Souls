const { Client, GatewayIntentBits } = require('discord.js');
const { handleCommand } = require('./commands.js');

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

client.on('messageCreate', (message) => {
  handleCommand(message);
});

client.login(process.env.TOKEN);
      .setFooter({ text: 'Souls Bot • Dank Memer Style' });

    return message.reply({ embeds: [helpEmbed] });
  }
