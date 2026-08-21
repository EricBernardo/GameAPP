// Catálogo de skins com preço fixo e visível — sem sorteio/gacha,
// alinhado à recomendação de monetização da auditoria de mercado.
export const SKINS = [
  { id: "classico", name: "Clássico", color: "#ffffff", price: 0 },
  { id: "coral", name: "Coral", color: "#ff5f6d", price: 40 },
  { id: "oceano", name: "Oceano", color: "#4cc9f0", price: 40 },
  { id: "solar", name: "Solar", color: "#ffd166", price: 60 },
  { id: "esmeralda", name: "Esmeralda", color: "#06d6a0", price: 60 },
  { id: "violeta", name: "Violeta", color: "#c77dff", price: 80 },
  { id: "magma", name: "Magma", color: "#ff9f1c", price: 80 },
  { id: "safira", name: "Safira", color: "#5390d9", price: 100 },
  { id: "choque", name: "Rosa Choque", color: "#f15bb5", price: 100 },
  { id: "lendaria", name: "Dourada Lendária", color: "#ffe66d", price: 220 },
];

export const DEFAULT_SKIN_ID = "classico";

export function skinById(id) {
  return SKINS.find((s) => s.id === id) || SKINS[0];
}
