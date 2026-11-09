const { getUser } = require('./database.js');

// Cooldown storage trackers (in milliseconds)
const dailyCooldowns = {};
const weeklyCooldowns = {};
const monthlyCooldowns = {};

function handleRewards(message, command) {
  const userId = message.author.id;
  const user = getUser(userId);
  const now = Date.now();

  // 1. DAILY REWARD (24 Hours)
  if (command === 'daily') {
    const cooldownTime = 24 * 60 * 60 * 1000;
    if (dailyCooldowns[userId] && now - dailyCooldowns[userId] < cooldownTime) {
      const timeLeft = Math.ceil((dailyCooldowns[userId] + cooldownTime - now) / (1000 * 60 * 60));
      return message.reply(`⏳ You already claimed your daily reward! Come back in **${timeLeft} hours**.`);
    }

    const reward = 500;
    user.balance += reward;
    dailyCooldowns[userId] = now;
    return message.reply(`🎁 You claimed your daily reward of **${reward}** coins! 🪙`);
  }

  // 2. WEEKLY REWARD (7 Days)
  if (command === 'weekly') {
    const cooldownTime = 7 * 24 * 60 * 60 * 1000;
    if (weeklyCooldowns[userId] && now - weeklyCooldowns[userId] < cooldownTime) {
      const daysLeft = Math.ceil((weeklyCooldowns[userId] + cooldownTime - now) / (1000 * 60 * 60 * 24));
      return message.reply(`⏳ You already claimed your weekly reward! Come back in **${daysLeft} days**.`);
    }

    const reward = 3500;
    user.balance += reward;
    weeklyCooldowns[userId] = now;
    return message.reply(`🗓️ You claimed your weekly reward of **${reward}** coins! 🪙`);
  }

  // 3. MONTHLY REWARD (30 Days)
  if (command === 'monthly') {
    const cooldownTime = 30 * 24 * 60 * 60 * 1000;
    if (monthlyCooldowns[userId] && now - monthlyCooldowns[userId] < cooldownTime) {
      return message.reply(`⏳ You already claimed your monthly reward this month! Check back later.`);
    }

    const reward = 15000;
    user.balance += reward;
    monthlyCooldowns[userId] = now;
    return message.reply(`🏆 **JACKPOT!** You claimed your massive monthly reward of **${reward}** coins! 🎉`);
  }
}

module.exports = { handleRewards };
