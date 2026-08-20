// Banco de perguntas fixo (sem geração por IA/aleatória de conteúdo) —
// cada pergunta tem uma resposta curta e verdadeira conhecida pelo app,
// que se mistura com os "blefes" escritos pelos jogadores.
export const QUESTIONS = [
  { category: "Corpo humano", q: "Quantos ossos tem o esqueleto de um adulto?", answer: "206" },
  { category: "Animais", q: "Qual é o animal terrestre mais rápido do mundo?", answer: "Guepardo" },
  { category: "História", q: "Em que ano o homem pisou na Lua pela primeira vez?", answer: "1969" },
  { category: "Geografia", q: "Qual é a capital da Austrália?", answer: "Camberra" },
  { category: "Animais", q: "Quantos corações tem um polvo?", answer: "3" },
  { category: "Geografia", q: "Qual é o maior deserto do mundo (incluindo os gelados)?", answer: "Antártica" },
  { category: "Animais", q: "Quantas patas tem uma aranha?", answer: "8" },
  { category: "Geografia", q: "Em que continente fica o Egito?", answer: "África" },
  { category: "Ciência", q: "Qual é o único metal líquido à temperatura ambiente?", answer: "Mercúrio" },
  { category: "Corpo humano", q: "Quantos dentes tem um adulto, em média?", answer: "32" },
  { category: "Curiosidades", q: "Qual é o maior órgão do corpo humano?", answer: "Pele" },
  { category: "Animais", q: "Qual é o único mamífero capaz de voar de verdade?", answer: "Morcego" },
  { category: "Ciência", q: "Qual é o elemento químico mais abundante no universo?", answer: "Hidrogênio" },
  { category: "Geografia", q: "Qual é o rio mais longo do mundo?", answer: "Rio Nilo" },
  { category: "Curiosidades", q: "Quantas cordas tem um violão comum?", answer: "6" },
];

export function shuffledQuestions() {
  return [...QUESTIONS].sort(() => Math.random() - 0.5);
}
