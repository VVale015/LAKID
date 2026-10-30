// frontend/src/types.ts
export type Role = "student" | "guardian" | "instructor";

export type AreaKey = "colors" | "alphabet" | "reading" | "games";

export type Difficulty = 1 | 2 | 3;

export interface Student {
  id: string;
  name: string;
  avatar: string;
  age: number;
  progress: number;
  activitiesCompleted: number;
  achievements: string[];
  areaProgress: Record<AreaKey, number>;
  areaActivities: Record<AreaKey, number>;
}

export interface LibraryActivity {
  id: string;
  area: AreaKey;
  title: string;
  description: string;
  difficulty: Difficulty;
  emoji: string;
}

export interface Assignment {
  id: string;
  studentId: string;
  activityId: string;
  assignedAt: string;
  dueDate: string | null;
  completedAt: string | null;
}

export interface ActivityResult {
  studentId: string;
  area: AreaKey;
  activityName: string;
  score: number;
  date: string;
}

export type Feedback = "correct" | "incorrect" | null;

export interface ColorQuestion {
  id: number;
  prompt: string;
  correctColor: string;
  options: string[];
  emoji: string;
}

export interface LetterQuestion {
  id: number;
  letter: string;
  word: string;
  emoji: string;
  options: string[];
}

export interface ReadingStory {
  id: number;
  title: string;
  emoji: string;
  text: string;
  image: string;
  questions: { id: number; question: string; options: string[]; answer: number }[];
}

export interface MemoryCard {
  id: number;
  emoji: string;
  label: string;
}

export type AssistantAudience = "student" | "guardian";

export type AssistantTopic = "todo" | "letra" | "noEntiendo" | "explicar" | "rutina" | "lectura" | "frustracion";

export interface AssistantTopicContent {
  topic: AssistantTopic;
  question: string;
  keywords: string[];
  reply: string;
}

export interface ChatMessage {
  id: string;
  author: "user" | "assistant";
  text: string;
}
