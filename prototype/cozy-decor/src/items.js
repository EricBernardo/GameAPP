export const GRID_COLS = 5;
export const GRID_ROWS = 4;

export const CATEGORIES = ["Básico", "Plantas", "Praia", "Espaço", "Aconchego"];

export const ITEMS = [
  { id: "sofa", name: "Sofá", icon: "🛋️", price: 0, category: "Básico", tags: ["conforto"], unlockLevel: 1, starter: true },
  { id: "mesa", name: "Mesa", icon: "🪵", price: 0, category: "Básico", tags: ["conforto"], unlockLevel: 1, starter: true },
  { id: "tapete", name: "Tapete", icon: "🟪", price: 20, category: "Básico", tags: ["aconchego"], unlockLevel: 1 },
  { id: "quadro", name: "Quadro", icon: "🖼️", price: 25, category: "Básico", tags: ["arte"], unlockLevel: 1 },
  { id: "lampada", name: "Lâmpada", icon: "💡", price: 15, category: "Básico", tags: ["aconchego"], unlockLevel: 1 },

  { id: "planta1", name: "Samambaia", icon: "🪴", price: 30, category: "Plantas", tags: ["planta", "tropical"], unlockLevel: 1 },
  { id: "cacto", name: "Cacto", icon: "🌵", price: 20, category: "Plantas", tags: ["planta", "deserto"], unlockLevel: 1 },
  { id: "flor", name: "Vaso de Flores", icon: "🌸", price: 25, category: "Plantas", tags: ["planta", "aconchego"], unlockLevel: 2 },
  { id: "arvore", name: "Arvorezinha", icon: "🌳", price: 45, category: "Plantas", tags: ["planta", "tropical"], unlockLevel: 3 },

  { id: "guardasol", name: "Guarda-sol", icon: "⛱️", price: 40, category: "Praia", tags: ["praia", "tropical"], unlockLevel: 2 },
  { id: "boia", name: "Boia", icon: "🍩", price: 22, category: "Praia", tags: ["praia"], unlockLevel: 2 },
  { id: "concha", name: "Concha", icon: "🐚", price: 18, category: "Praia", tags: ["praia"], unlockLevel: 2 },
  { id: "coqueiro", name: "Coqueiro", icon: "🌴", price: 50, category: "Praia", tags: ["praia", "tropical"], unlockLevel: 3 },

  { id: "foguete", name: "Foguete", icon: "🚀", price: 60, category: "Espaço", tags: ["espaco"], unlockLevel: 3 },
  { id: "estrela", name: "Luz Estelar", icon: "✨", price: 35, category: "Espaço", tags: ["espaco", "brilho"], unlockLevel: 3 },
  { id: "planeta", name: "Mobile de Planetas", icon: "🪐", price: 55, category: "Espaço", tags: ["espaco", "brilho"], unlockLevel: 4 },

  { id: "vela", name: "Vela", icon: "🕯️", price: 12, category: "Aconchego", tags: ["aconchego"], unlockLevel: 1 },
  { id: "almofada", name: "Almofada", icon: "🧸", price: 18, category: "Aconchego", tags: ["aconchego", "conforto"], unlockLevel: 2 },
  { id: "livro", name: "Pilha de Livros", icon: "📚", price: 16, category: "Aconchego", tags: ["arte", "aconchego"], unlockLevel: 1 },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const REQUEST_TAGS = [
  { tag: "tropical", text: "Quero um cantinho tropical! 🌴" },
  { tag: "praia", text: "Sonho com um clima de praia! 🏖️" },
  { tag: "espaco", text: "Adoraria algo do espaço sideral! 🌌" },
  { tag: "conforto", text: "Preciso de um lugar confortável pra sentar. 🛋️" },
  { tag: "aconchego", text: "Quero um ambiente bem aconchegante. 🕯️" },
  { tag: "arte", text: "Um toque de arte deixaria tudo lindo! 🎨" },
  { tag: "planta", text: "Este espaço precisa de mais verde! 🌱" },
  { tag: "deserto", text: "Que tal um visual de deserto? 🌵" },
  { tag: "brilho", text: "Algo brilhante ia arrasar aqui! ✨" },
];

export const CUSTOMER_NAMES = ["Nino", "Zaza", "Kiko", "Miu", "Tuko", "Bibi", "Yumi", "Fofo"];

export const LEVEL_XP = [0, 60, 150, 280, 450, 700];

export function levelFromXp(xp) {
  let level = 1;
  for (let i = 0; i < LEVEL_XP.length; i++) {
    if (xp >= LEVEL_XP[i]) level = i + 1;
  }
  return Math.min(level, LEVEL_XP.length);
}
