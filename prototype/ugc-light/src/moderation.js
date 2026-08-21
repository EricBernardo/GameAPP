// Filtro básico de conteúdo para nomes de fase (Fase 4 da auditoria de
// qualidade). Isto é uma primeira linha de defesa client-side — NÃO
// substitui moderação real (revisão humana, denúncia da comunidade,
// filtro server-side) exigida antes de qualquer recurso de
// compartilhamento entre jogadores. Ver README.md, seção "Política de
// moderação de conteúdo", para o que ainda falta antes disso.
const BLOCKED_WORDS = [
  "porra", "merda", "caralho", "puta", "buceta", "cu", "foda", "fdp",
  "arrombado", "viado", "retardado", "idiota", "burro", "nazista",
  "fuck", "shit", "bitch", "asshole", "nigger", "faggot", "cunt",
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function containsBlockedWord(text) {
  const normalized = normalize(text);
  return BLOCKED_WORDS.some((word) => normalized.includes(word));
}

export function validateLevelName(name) {
  const trimmed = name.trim();
  if (!trimmed) return { valid: true, name: "Fase sem nome" };
  if (containsBlockedWord(trimmed)) {
    return { valid: false, reason: "Esse nome não é permitido. Escolha outro." };
  }
  if (trimmed.length > 24) {
    return { valid: false, reason: "Nome muito longo (máximo 24 caracteres)." };
  }
  return { valid: true, name: trimmed };
}
