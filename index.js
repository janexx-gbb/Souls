const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Simple In-Memory Database (Per User)
const db = {};

function getUser(id) {
  if (!db[id]) {
    db[id] = {
      balance: 100,
      inventory: {} // { item_id: count }
    };
  }
  return db[id];
}

// Shop items definition
const SHOP = {
  rifle: { name: 'Hunting Rifle 🔫', price: 250, description: 'Required to go hunting' },
  bait: { name: 'Animal Bait 🥩', price: 50, description: 'Increases hunting luck' }
};

// Animals setup (name, catch chance, sell price)
const ANIMALS = [
  { name: 'Rabbit 🐇', sellPrice: 30 },
  { name: 'Deer 🦌', sellPrice: 85 },
  { name: 'Wild Boar 🐗', sellPrice: 150 },
  { name: 'Bear 🐻', sellPrice: 300 }
];

client.on('ready', () => {
  console.log(`Bot active as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const user = getUser(message.author.id);

  // 1. BALANCE COMMAND
  if (command === 'bal' || command === 'balance') {
    return message.reply(`💳 **${message.author.username}'s Balance:** ${user.balance} coins`);
  }

  // 2. WORK COMMAND
  if (command === 'work') {
    const jobs = ['Software Engineer 💻', 'Barista ☕', 'Delivery Driver 🚗', 'Fisherman 🎣'];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * 120) + 50;

    user.balance += earnings;
    return message.reply(`You worked as a **${job}** and earned **${earnings}** coins! 🪙`);
  }

  // 3. GAMBLE / GAMES
  if (command === 'coinflip') {
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!['heads', 'tails'].includes(choice) || isNaN(bet) || bet <= 0) {
      return message.reply('Usage: `!coinflip <heads|tails> <bet_amount>`');
    }
    if (user.balance < bet) {
      return message.reply('❌ You do not have enough coins!');
    }

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    if (choice === result) {
      user.balance += bet;
      return message.reply(`🪙 The coin landed on **${result}**! You won **${bet}** coins! 🎉`);
    } else {
      user.balance -= bet;
      return message.reply(`🪙 The coin landed on **${result}**! You lost **${bet}** coins.`);
    }
  }

  // 4. HUNT ANIMALS
  if (command === 'hunt') {
    if (!user.inventory['rifle'] || user.inventory['rifle'] <= 0) {
      return message.reply('❌ You need a **Hunting Rifle 🔫** to hunt! Buy one using `!buy rifle`.');
    }

    const outcome = Math.random();
    if (outcome < 0.35) {
      return message.reply('🌲 You spent hours in the forest but caught nothing!');
    }

    const caught = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    const animalId = caught.name.toLowerCase().split(' ')[0];

    user.inventory[animalId] = (user.inventory[animalId] || 0) + 1;
    return message.reply(`🏹 **Bullseye!** You hunted a **${caught.name}**! Added to inventory.`);
  }

  // 5. SHOP & INVENTORY
  if (command === 'shop') {
    let shopMsg = '**🛒 ITEM SHOP**\n\n';
    for (const [id, item] of Object.entries(SHOP)) {
      shopMsg += `• \`!buy ${id}\` — **${item.name}** | 💰 ${item.price} coins\n  _${item.description}_\n`;
    }
    return message.reply(shopMsg);
  }

  if (command === 'buy') {
    const itemId = args[0]?.toLowerCase();
    const item = SHOP[itemId];

    if (!item) return message.reply('❌ Invalid item ID! Use `!shop` to see available items.');
    if (user.balance < item.price) return message.reply('❌ You cannot afford this item!');

    user.balance -= item.price;
    user.inventory[itemId] = (user.inventory[itemId] || 0) + 1;
    return message.reply(`✅ Purchased **${item.name}** for **${item.price}** coins!`);
  }

  if (command === 'inv' || command === 'inventory') {
    const items = Object.entries(user.inventory).filter(([_, qty]) => qty > 0);
    if (items.length === 0) return message.reply('🎒 Your inventory is completely empty!');

    let invMsg = `**🎒 ${message.author.username}'s Inventory:**\n`;
    items.forEach(([id, qty]) => {
      invMsg += `• **${id}**: x${qty}\n`;
    });
    return message.reply(invMsg);
  }

  // 6. SELL SYSTEM
  if (command === 'sell') {
    const itemId = args[0]?.toLowerCase();
    if (!itemId) return message.reply('Usage: `!sell <item_name>` (e.g., `!sell rabbit`)');

    if (!user.inventory[itemId] || user.inventory[itemId] <= 0) {
      return message.reply(`❌ You do not have any **${itemId}** to sell!`);
    }

    const animal = ANIMALS.find(a => a.name.toLowerCase().includes(itemId));
    const price = animal ? animal.sellPrice : 20;

    user.inventory[itemId] -= 1;
    user.balance += price;
    return message.reply(`💰 You sold 1 **${itemId}** for **${price}** coins!`);
  }
});

client.login(process.env.TOKEN);
