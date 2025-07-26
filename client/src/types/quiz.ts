export interface QuizWithQuestions {
  id: string;
  title: string;
  description: string | null;
  timePerQuestion: number;
  createdBy: string | null;
  createdAt: Date | null;
  questions: Question[];
}

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string | null;
  optionD: string | null;
  correctAnswer: string;
  order: number;
}

export interface QuizSession {
  id: string;
  quizId: string;
  pin: string;
  hostId: string | null;
  status: string;
  currentQuestionIndex: number | null;
  startedAt: Date | null;
  endedAt: Date | null;
}

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  score: number | null;
  joinedAt: Date | null;
}

export interface PlayerResponse {
  id: string;
  playerId: string;
  questionId: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  responseTime: number | null;
  submittedAt: Date | null;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  timePerQuestion: number;
  questions: {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC?: string;
    optionD?: string;
    correctAnswer: string;
    order: number;
  }[];
}
