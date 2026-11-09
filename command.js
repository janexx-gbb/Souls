const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getUser, SHOP, ANIMALS } = require('./database.js');
const { handleRewards } = require('./rewards.js');

async function handleCommand(message) {
  // Ignore bots and messages without prefix
  if (message.author.bot || !message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const user = getUser(message.author.id);

  // 1. REWARD COMMANDS (Daily, Weekly, Monthly)
  if (['daily', 'weekly', 'monthly'].includes(command)) {
    return handleRewards(message, command);
  }

  // 2. HELP COMMAND
  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🎮 Bot Command List')
      .setDescription('Here are all the available commands you can use:')
      .addFields(
        { name: '💰 Economy & Jobs', value: '`!bal` — Check coin balance\n`!work` — Work a job to earn coins\n`!daily` / `!weekly` / `!monthly` — Claim streak rewards' },
        { name: '🎲 Fun & Gambling', value: '`!coinflip <heads|tails> <amount>` — Gamble coins' },
        { name: '🏹 Hunting & Gathering', value: '`!hunt` — Go hunting for animals *(Requires rifle)*' },
        { name: '🛒 Market & Inventory', value: '`!shop` — View shop items\n`!buy <item>` — Buy an item\n`!inv` — Check inventory\n`!sell <item>` — Sell hunted animals' },
        { name: '🛡️ Admin Commands (Admins Only)', value: '`!give @user <amount>` — Give coins\n`!take @user <amount>` — Take coins\n`!resetbal @user` — Reset balance' }
      )
      .setFooter({ text: 'Souls Bot • Modular System' });

    return message.reply({ embeds: [helpEmbed] });
  }

  // 3. ECONOMY & BALANCE
  if (command === 'bal' || command === 'balance') {
    return message.reply(`💳 **${message.author.username}'s Balance:** ${user.balance} coins`);
  }

  // 4. WORK
  if (command === 'work') {
    const jobs = ['Software Engineer 💻', 'Barista ☕', 'Delivery Driver 🚗', 'Fisherman 🎣'];
    const job = jobs[Math.floor(Math.random() * jobs.length)];
    const earnings = Math.floor(Math.random() * 120) + 50;

    user.balance += earnings;
    return message.reply(`You worked as a **${job}** and earned **${earnings}** coins! 🪙`);
  }

  // 5. FUN (COINFLIP)
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

  // 6. HUNT
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

  // 7. MARKET (SHOP, BUY, INV, SELL)
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

  // 8. ADMIN COMMANDS
  if (['give', 'take', 'resetbal'].includes(command)) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You do not have permission to use admin commands!');
    }
  }

  if (command === 'give') {
    const targetUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!targetUser || isNaN(amount) || amount <= 0) {
      return message.reply('Usage: `!give @user <amount>`');
    }

    const targetData = getUser(targetUser.id);
    targetData.balance += amount;
    return message.reply(`✅ Successfully gave **${amount}** coins to ${targetUser.username}!`);
  }

  if (command === 'take') {
    const targetUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!targetUser || isNaN(amount) || amount <= 0) {
      return message.reply('Usage: `!take @user <amount>`');
    }

    const targetData = getUser(targetUser.id);
    targetData.balance = Math.max(0, targetData.balance - amount);
    return message.reply(`✅ Successfully took **${amount}** coins from ${targetUser.username}!`);
  }

  if (command === 'resetbal') {
    const targetUser = message.mentions.users.first();
    if (!targetUser) {
      return message.reply('Usage: `!resetbal @user`');
    }

    const targetData = getUser(targetUser.id);
    targetData.balance = 0;
    return message.reply(`🔄 Reset ${targetUser.username}'s balance to **0** coins.`);
  }
}

module.exports = { handleCommand };
