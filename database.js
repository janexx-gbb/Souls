const db = {};

function getUser(id) {
  if (!db[id]) {
    db[id] = {
      balance: 100,
      inventory: {} 
    };
  }
  return db[id];
}

const SHOP = {
  rifle: { name: 'Hunting Rifle 🔫', price: 250, description: 'Required to go hunting' },
  bait: { name: 'Animal Bait 🥩', price: 50, description: 'Increases hunting luck' }
};

const ANIMALS = [
  { name: 'Rabbit 🐇', sellPrice: 30 },
  { name: 'Deer 🦌', sellPrice: 85 },
  { name: 'Wild Boar 🐗', sellPrice: 150 },
  { name: 'Bear 🐻', sellPrice: 300 }
];

module.exports = { getUser, SHOP, ANIMALS };
