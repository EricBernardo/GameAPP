// Progressão determinística: cada criatura só pode ser adotada depois da
// anterior, e o custo/produção de cada uma é fixo — sem sorteio (gacha).
export const CREATURES = [
  { id: "fofinho", name: "Fofinho", icon: "🐰", unlockCost: 10, baseProduction: 1 },
  { id: "bolinha", name: "Bolinha", icon: "🐱", unlockCost: 22, baseProduction: 3 },
  { id: "pipoca", name: "Pipoca", icon: "🐹", unlockCost: 150, baseProduction: 8 },
  { id: "nuvinha", name: "Nuvinha", icon: "☁️", unlockCost: 500, baseProduction: 20 },
  { id: "estelar", name: "Estelar", icon: "⭐", unlockCost: 1500, baseProduction: 50 },
  { id: "gotinha", name: "Gotinha", icon: "💧", unlockCost: 5000, baseProduction: 120 },
  { id: "brotinho", name: "Brotinho", icon: "🌱", unlockCost: 15000, baseProduction: 280 },
  { id: "faisca", name: "Faísca", icon: "🦊", unlockCost: 45000, baseProduction: 650 },
  { id: "marzipa", name: "Marzipã", icon: "🐻", unlockCost: 130000, baseProduction: 1500 },
  { id: "cometa", name: "Cometa", icon: "☄️", unlockCost: 400000, baseProduction: 3500 },
];

export const UPGRADE_BASE_COST_FACTOR = 1.5;
export const UPGRADE_COST_GROWTH = 1.18;
export const UPGRADE_PRODUCTION_GROWTH = 1.12;

export function productionAtLevel(creature, level) {
  return creature.baseProduction * Math.pow(UPGRADE_PRODUCTION_GROWTH, level - 1);
}

export function upgradeCost(creature, currentLevel) {
  const base = creature.unlockCost * UPGRADE_BASE_COST_FACTOR;
  return Math.ceil(base * Math.pow(UPGRADE_COST_GROWTH, currentLevel - 1));
}

export const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
export const OFFLINE_EFFICIENCY = 0.5;
export const BOOST_MULTIPLIER = 2;
export const BOOST_DURATION_SECONDS = 60;
export const BOOST_COOLDOWN_SECONDS = 90;
