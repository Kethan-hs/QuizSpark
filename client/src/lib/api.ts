import { apiRequest } from "./queryClient";
import type { 
  QuizWithQuestions, 
  QuizSession, 
  Player, 
  CreateQuizData 
} from "@/types/quiz";

export const api = {
  // Quiz endpoints
  async getQuizzes() {
    const response = await apiRequest("GET", "/api/quizzes");
    return response.json();
  },

  async getQuiz(id: string): Promise<QuizWithQuestions> {
    const response = await apiRequest("GET", `/api/quizzes/${id}`);
    return response.json();
  },

  async createQuiz(quiz: CreateQuizData) {
    // First create the quiz
    const quizResponse = await apiRequest("POST", "/api/quizzes", {
      title: quiz.title,
      description: quiz.description,
      timePerQuestion: quiz.timePerQuestion,
    });
    const createdQuiz = await quizResponse.json();

    // Then create all questions
    for (const question of quiz.questions) {
      await apiRequest("POST", `/api/quizzes/${createdQuiz.id}/questions`, question);
    }

    return createdQuiz;
  },

  // Session endpoints
  async createSession(quizId: string): Promise<QuizSession> {
    const response = await apiRequest("POST", "/api/sessions", { quizId });
    return response.json();
  },

  async getSessionByPin(pin: string): Promise<QuizSession> {
    const response = await apiRequest("GET", `/api/sessions/pin/${pin}`);
    return response.json();
  },

  async getSession(id: string): Promise<QuizSession> {
    const response = await apiRequest("GET", `/api/sessions/${id}`);
    return response.json();
  },

  async updateSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession> {
    const response = await apiRequest("PATCH", `/api/sessions/${id}`, updates);
    return response.json();
  },

  // Player endpoints
  async joinSession(sessionId: string, name: string): Promise<Player> {
    const response = await apiRequest("POST", `/api/sessions/${sessionId}/players`, { name });
    return response.json();
  },

  async getSessionPlayers(sessionId: string): Promise<Player[]> {
    const response = await apiRequest("GET", `/api/sessions/${sessionId}/players`);
    return response.json();
  },

  async updatePlayerScore(playerId: string, score: number): Promise<Player> {
    const response = await apiRequest("PATCH", `/api/players/${playerId}/score`, { score });
    return response.json();
  },

  // Response endpoints
  async submitResponse(response: {
    playerId: string;
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    responseTime: number;
  }) {
    const apiResponse = await apiRequest("POST", "/api/responses", response);
    return apiResponse.json();
  },

  async getQuestionResponses(questionId: string) {
    const response = await apiRequest("GET", `/api/questions/${questionId}/responses`);
    return response.json();
  },
};
