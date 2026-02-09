export type QuestionType = "庙号" | "谥号";

export interface Question {
  id: string;
  emperorName: string;
  dynasty: string;
  questionType: QuestionType;  // Whether this question asks for 庙号 or 谥号
  correctTitle: string;        // Full title for results display, e.g., "太宗"
  correctAnswer: string;       // The fill-in answer, e.g., "太"
  options: string[];           // Fill-in options
  templatePrefix: string;      // Display prefix, e.g., "唐"
  templateSuffix: string;      // Display suffix, e.g., "宗"
  hint: string;
  description: string;
  image: string;               // Textbook image in /images/emperors/
  dramaImage: string;          // Drama image in /images/now/
}

export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export enum Rank {
  GANG = '夯',
  TOP_TIER = '顶级',
  SUPERIOR = '人上人',
  NPC = 'NPC',
  TRASH = '拉完了'
}

export interface GameStats {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  history: {
    question: Question;
    userAnswer: string | null;
    isCorrect: boolean;
    timeTaken: number;
  }[];
}
