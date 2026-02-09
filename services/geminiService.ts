import { Question } from "../types";
import { questionBank } from "../data/questions";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

/**
 * Shuffle an array using Fisher-Yates algorithm.
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Fetch questions from the static question bank.
 * Randomly selects and shuffles questions each game.
 */
export const fetchQuestions = async (count: number = 5): Promise<Question[]> => {
  // Shuffle the entire question bank, then pick the requested count
  const shuffled = shuffleArray(questionBank);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Add unique IDs and shuffle each question's options
  return selected.map((q) => ({
    ...q,
    id: generateId(),
    options: shuffleArray(q.options),
  }));
};
