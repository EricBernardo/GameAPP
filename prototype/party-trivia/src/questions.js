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
  { category: "Esportes", q: "Quantos jogadores de cada time ficam em campo no futebol?", answer: "11" },
  { category: "Esportes", q: "De quantos em quantos anos acontecem os Jogos Olímpicos de Verão?", answer: "4" },
  { category: "Esportes", q: "Em que esporte se usa o termo 'slam dunk'?", answer: "Basquete" },
  { category: "Esportes", q: "Qual país tem mais títulos de Copa do Mundo de futebol?", answer: "Brasil" },
  { category: "Geografia", q: "Qual é o menor país do mundo?", answer: "Vaticano" },
  { category: "Geografia", q: "Em que país fica a Torre Eiffel?", answer: "França" },
  { category: "Geografia", q: "Qual é o oceano mais profundo do mundo?", answer: "Pacífico" },
  { category: "Geografia", q: "Qual é a montanha mais alta do mundo?", answer: "Monte Everest" },
  { category: "Geografia", q: "Qual é o maior país do mundo em área?", answer: "Rússia" },
  { category: "Animais", q: "Qual é o maior animal do mundo?", answer: "Baleia-azul" },
  { category: "Animais", q: "Qual é a única ave que não consegue voar e é a maior do mundo?", answer: "Avestruz" },
  { category: "Animais", q: "Quantos corações tem uma minhoca?", answer: "5" },
  { category: "Animais", q: "Qual animal marinho é considerado um dos mais inteligentes do mundo?", answer: "Delfim" },
  { category: "Ciência", q: "Qual é o planeta mais próximo do Sol?", answer: "Mercúrio" },
  { category: "Ciência", q: "Quantos ossos tem o pescoço de uma girafa?", answer: "7" },
  { category: "Ciência", q: "Além de vapor de água, qual gás os humanos soltam ao respirar?", answer: "Dióxido de carbono" },
  { category: "Ciência", q: "Quantos ossos tem, aproximadamente, um bebê recém-nascido?", answer: "300" },
  { category: "História", q: "Em que século os portugueses chegaram ao Brasil?", answer: "XVI" },
  { category: "História", q: "Quem pintou a Mona Lisa?", answer: "Leonardo da Vinci" },
  { category: "Cultura", q: "Qual instrumento musical tem 88 teclas?", answer: "Piano" },
  { category: "Cultura", q: "Em que país nasceu o samba?", answer: "Brasil" },
  { category: "Cultura", q: "Qual é a língua com mais falantes nativos no mundo?", answer: "Mandarim" },
  { category: "Tecnologia", q: "Qual empresa criou o iPhone?", answer: "Apple" },
  { category: "Tecnologia", q: "O que significa a sigla 'www'?", answer: "World Wide Web" },
  { category: "Alimentação", q: "De qual planta vem o chocolate?", answer: "Cacau" },
  { category: "Alimentação", q: "Qual fruta asiática é famosa pelo cheiro muito forte?", answer: "Durian" },
  { category: "Curiosidades", q: "De que cor é o sangue humano dentro do corpo, mesmo nas veias?", answer: "Vermelho" },
  { category: "Curiosidades", q: "Quantos litros de sangue tem, em média, um adulto?", answer: "5" },
  { category: "Curiosidades", q: "Quantas horas, em média, um gato passa dormindo por dia?", answer: "15" },
];

// Fisher-Yates — embaralhamento sem viés (diferente de sort com
// comparador aleatório, que distribui as posições de forma desigual).
export function shuffledQuestions() {
  const copy = [...QUESTIONS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
