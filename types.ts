export interface Question {
  id: string;
  emperorName: string;
  dynasty: string;
  correctTitle: string;
  options: string[];
  hint: string;
  description: string; // A short description for context
}

export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export enum Rank {
  TOP_TIER = '顶级',
  SUPERIOR = '人上人',
  SOLID = '夯',
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