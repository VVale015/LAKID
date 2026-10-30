// frontend/src/data.ts
import type {
  Assignment,
  AssistantAudience,
  AssistantTopicContent,
  ColorQuestion,
  Difficulty,
  LetterQuestion,
  LibraryActivity,
  MemoryCard,
  ReadingStory,
  Student,
} from "./types";

export const students: Student[] = [
  {
    id: "s1",
    name: "Mateo",
    avatar: "🦁",
    age: 7,
    progress: 45,
    activitiesCompleted: 18,
    achievements: ["Primeros pasos", "Experto en colores", "Lector novato"],
    areaProgress: { colors: 70, alphabet: 40, reading: 30, games: 50 },
    areaActivities: { colors: 7, alphabet: 4, reading: 3, games: 4 },
  },
  {
    id: "s2",
    name: "Sofía",
    avatar: "🦄",
    age: 6,
    progress: 60,
    activitiesCompleted: 24,
    achievements: ["Primeros pasos", "Memoria brillante", "Estrella del abecedario"],
    areaProgress: { colors: 80, alphabet: 65, reading: 40, games: 70 },
    areaActivities: { colors: 8, alphabet: 7, reading: 4, games: 5 },
  },
  {
    id: "s3",
    name: "Lucas",
    avatar: "🐯",
    age: 8,
    progress: 30,
    activitiesCompleted: 12,
    achievements: ["Primeros pasos"],
    areaProgress: { colors: 50, alphabet: 20, reading: 15, games: 35 },
    areaActivities: { colors: 5, alphabet: 2, reading: 1, games: 4 },
  },
];

export const colorQuestions: ColorQuestion[] = [
  { id: 1, prompt: "¿De qué color es el cielo?", correctColor: "Azul", options: ["Rojo", "Azul", "Verde"], emoji: "🌤️" },
  { id: 2, prompt: "¿De qué color es la hierba?", correctColor: "Verde", options: ["Verde", "Amarillo", "Morado"], emoji: "🌿" },
  { id: 3, prompt: "¿De qué color es el sol?", correctColor: "Amarillo", options: ["Azul", "Naranja", "Amarillo"], emoji: "☀️" },
  { id: 4, prompt: "¿De qué color es la fresa?", correctColor: "Rojo", options: ["Rojo", "Verde", "Azul"], emoji: "🍓" },
  { id: 5, prompt: "¿De qué color es el elefante?", correctColor: "Gris", options: ["Rosado", "Gris", "Naranja"], emoji: "🐘" },
  { id: 6, prompt: "¿De qué color es la zanahoria?", correctColor: "Naranja", options: ["Naranja", "Morado", "Blanco"], emoji: "🥕" },
];

export const colorMap: Record<string, string> = {
  Rojo: "#EF4444",
  Azul: "#3B82F6",
  Verde: "#22C55E",
  Amarillo: "#FACC15",
  Naranja: "#F97316",
  Morado: "#A855F7",
  Gris: "#9CA3AF",
  Rosado: "#EC4899",
  Blanco: "#F3F4F6",
  Negro: "#374151",
};

export const letterQuestions: LetterQuestion[] = [
  { id: 1, letter: "A", word: "Árbol", emoji: "🌳", options: ["A", "E", "O"] },
  { id: 2, letter: "B", word: "Barco", emoji: "⛵", options: ["B", "D", "P"] },
  { id: 3, letter: "C", word: "Casa", emoji: "🏠", options: ["C", "G", "S"] },
  { id: 4, letter: "D", word: "Dedo", emoji: "👆", options: ["D", "B", "P"] },
  { id: 5, letter: "E", word: "Estrella", emoji: "⭐", options: ["E", "A", "I"] },
  { id: 6, letter: "G", word: "Gato", emoji: "🐱", options: ["G", "C", "Q"] },
  { id: 7, letter: "M", word: "Manzana", emoji: "🍎", options: ["M", "N", "W"] },
  { id: 8, letter: "P", word: "Pelota", emoji: "⚽", options: ["P", "B", "D"] },
];

export const readingStories: ReadingStory[] = [
  {
    id: 1,
    title: "El conejo y la zanahoria",
    emoji: "🐰",
    image: "https://images.pexels.com/photos/12397296/pexels-photo-12397296.jpeg?auto=compress&cs=tinysrgb&h=400",
    text: "Había una vez un conejo blanco llamado Tinto. A Tinto le encantaban las zanahorias. Un día encontró una zanahoria muy grande en el huerto. ¡Era tan grande que casi no podía cargarla! Tinto compartió la zanahoria con sus amigos. Todos comieron y fueron muy felices.",
    questions: [
      { id: 1, question: "¿Cómo se llamaba el conejo?", options: ["Tinto", "Conejo", "Blanco"], answer: 0 },
      { id: 2, question: "¿Qué le gustaba comer?", options: ["Manzanas", "Zanahorias", "Lechuga"], answer: 1 },
      { id: 3, question: "¿Con quién compartió?", options: ["Solo", "Sus amigos", "Su mamá"], answer: 1 },
    ],
  },
  {
    id: 2,
    title: "La abeja trabajadora",
    emoji: "🐝",
    image: "https://images.pexels.com/photos/36188894/pexels-photo-36188894.jpeg?auto=compress&cs=tinysrgb&h=400",
    text: "Maya era una abeja muy trabajadora. Todos los días volaba de flor en flor recogiendo polen. Hacía la miel más deliciosa del bosque. Los otros animales le agradecían su trabajo. Maya estaba muy orgullosa de ayudar a la naturaleza.",
    questions: [
      { id: 1, question: "¿Cómo se llamaba la abeja?", options: ["Maya", "Flor", "Bosque"], answer: 0 },
      { id: 2, question: "¿Qué recogía de las flores?", options: ["Miel", "Polen", "Agua"], answer: 1 },
      { id: 3, question: "¿Qué hacía con el polen?", options: ["Miel", "Cera", "Pan"], answer: 0 },
    ],
  },
];

export const memoryCards: MemoryCard[] = [
  { id: 1, emoji: "🍎", label: "Manzana" },
  { id: 2, emoji: "🍌", label: "Banano" },
  { id: 3, emoji: "🍇", label: "Uvas" },
  { id: 4, emoji: "🍓", label: "Fresa" },
  { id: 5, emoji: "🥕", label: "Zanahoria" },
  { id: 6, emoji: "🌽", label: "Maíz" },
];

export const areaMeta: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  colors: { label: "Colores", emoji: "🎨", color: "text-pink-500", bg: "from-pink-400 to-rose-400" },
  alphabet: { label: "Abecedario", emoji: "🔤", color: "text-sky-500", bg: "from-sky-400 to-blue-400" },
  reading: { label: "Lecturas", emoji: "📖", color: "text-amber-500", bg: "from-amber-400 to-orange-400" },
  games: { label: "Juegos", emoji: "🎮", color: "text-green-500", bg: "from-green-400 to-emerald-400" },
};

export const difficultyMeta: Record<Difficulty, { label: string; className: string }> = {
  1: { label: "Fácil", className: "bg-green-100 text-green-700" },
  2: { label: "Medio", className: "bg-sky-100 text-sky-700" },
  3: { label: "Avanzado", className: "bg-orange-100 text-orange-700" },
};

export const activityLibrary: LibraryActivity[] = [
  { id: "colors-basic", area: "colors", title: "Colores de la naturaleza", description: "Relaciona objetos cotidianos con su color.", difficulty: 1, emoji: "🌿" },
  { id: "colors-objects", area: "colors", title: "Animales y frutas", description: "Identifica el color de animales y frutas.", difficulty: 2, emoji: "🍓" },
  { id: "alphabet-letters", area: "alphabet", title: "Letras con dibujos", description: "Asocia cada letra con una imagen.", difficulty: 1, emoji: "🔤" },
  { id: "alphabet-words", area: "alphabet", title: "Palabras con su letra", description: "Encuentra la letra inicial de cada palabra.", difficulty: 2, emoji: "🅰️" },
  { id: "alphabet-similar", area: "alphabet", title: "Letras parecidas", description: "Distingue letras que se ven parecidas.", difficulty: 3, emoji: "🔎" },
  { id: "reading-rabbit", area: "reading", title: "El conejo y la zanahoria", description: "Lee un cuento corto y responde preguntas.", difficulty: 1, emoji: "🐰" },
  { id: "reading-bee", area: "reading", title: "La abeja trabajadora", description: "Lee sobre una abeja y su miel.", difficulty: 2, emoji: "🐝" },
  { id: "reading-comprehension", area: "reading", title: "Comprensión de cuentos", description: "Responde preguntas con más detalles.", difficulty: 3, emoji: "📖" },
  { id: "games-pairs", area: "games", title: "Encontrar parejas", description: "Une las tarjetas que son iguales.", difficulty: 1, emoji: "🃏" },
  { id: "games-memory", area: "games", title: "Memoria de imágenes", description: "Recuerda dónde estaba cada dibujo.", difficulty: 2, emoji: "🧠" },
];

export const initialAssignments: Assignment[] = [
  { id: "a1", studentId: "s1", activityId: "colors-basic", assignedAt: "2026-10-10", dueDate: "2026-10-20", completedAt: "2026-10-18" },
  { id: "a2", studentId: "s1", activityId: "alphabet-letters", assignedAt: "2026-10-21", dueDate: "2026-10-25", completedAt: null },
  { id: "a3", studentId: "s1", activityId: "reading-rabbit", assignedAt: "2026-10-26", dueDate: "2026-11-05", completedAt: null },
  { id: "a4", studentId: "s2", activityId: "games-pairs", assignedAt: "2026-10-22", dueDate: null, completedAt: "2026-10-27" },
  { id: "a5", studentId: "s3", activityId: "alphabet-words", assignedAt: "2026-10-24", dueDate: "2026-11-02", completedAt: null },
];

export const assistantContent: Record<AssistantAudience, AssistantTopicContent[]> = {
  student: [
    {
      topic: "todo",
      question: "¿Qué tengo que hacer?",
      keywords: ["hacer", "tarea", "actividad", "toca"],
      reply: "¡Muy bien que preguntes! Primero elige un módulo en el menú principal. Luego toca una actividad y sigue las instrucciones. ¡Tú puedes!",
    },
    {
      topic: "letra",
      question: "¿Me ayudas con esta letra?",
      keywords: ["letra", "abecedario"],
      reply: "Mira la letra grande. Piensa en una palabra que empiece con ella. Por ejemplo: A de Árbol. ¡Excelente!",
    },
    {
      topic: "noEntiendo",
      question: "No entiendo",
      keywords: ["no entiendo", "entiendo", "confund"],
      reply: "No te preocupes, es normal. Lee la pregunta otra vez, despacio. Mira bien los dibujos. ¡Sigue intentando!",
    },
    {
      topic: "explicar",
      question: "¿Me lo puedes explicar?",
      keywords: ["explic"],
      reply: "Claro. Mira el dibujo y piensa qué ves. Luego elige la respuesta que más se parece. Un paso a la vez.",
    },
  ],
  guardian: [
    {
      topic: "rutina",
      question: "¿Cómo lo acompaño hoy?",
      keywords: ["acompan", "hoy", "rutina", "dia"],
      reply: "Practiquen de 10 a 15 minutos al día. Empiecen con una actividad corta y celebren cada avance. Terminen con algo que le guste.",
    },
    {
      topic: "letra",
      question: "¿Cómo practicamos letras en casa?",
      keywords: ["letra", "abecedario"],
      reply: "Use tarjetas con una letra grande y un dibujo. Pídale una palabra que empiece con esa letra. Repita las que le cuesten, con calma.",
    },
    {
      topic: "lectura",
      question: "¿Cómo le leo un cuento?",
      keywords: ["cuento", "leer", "lectura"],
      reply: "Lea en voz alta, con calma, señalando las imágenes. Al terminar, pregunte: ¿Quién era el personaje? ¿Qué pasó primero?",
    },
    {
      topic: "frustracion",
      question: "¿Qué hago si se frustra?",
      keywords: ["frustr", "llora", "enoj", "no quiere"],
      reply: "Es normal que se frustre. Haga una pausa corta, use un tono tranquilo y reduzca la dificultad por un momento. Lo importante es que disfrute aprender.",
    },
  ],
};

export const assistantFallback: Record<AssistantAudience, string> = {
  student: "Buena pregunta. Intenta escribirla de otra forma o toca uno de los botones de abajo.",
  guardian: "Gracias por su pregunta. Pruebe con uno de los botones de abajo para ver una orientación.",
};
