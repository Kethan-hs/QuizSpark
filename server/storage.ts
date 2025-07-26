import { 
  type User, type InsertUser, 
  type Quiz, type InsertQuiz,
  type Question, type InsertQuestion,
  type QuizSession, type InsertSession,
  type Player, type InsertPlayer,
  type PlayerResponse, type InsertResponse
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quiz methods
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizWithQuestions(id: string): Promise<(Quiz & { questions: Question[] }) | undefined>;
  createQuiz(quiz: InsertQuiz & { createdBy?: string }): Promise<Quiz>;
  getQuizzes(): Promise<Quiz[]>;
  
  // Question methods
  getQuestions(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion & { quizId: string }): Promise<Question>;
  
  // Session methods
  getSession(id: string): Promise<QuizSession | undefined>;
  getSessionByPin(pin: string): Promise<QuizSession | undefined>;
  createSession(session: InsertSession & { hostId?: string }): Promise<QuizSession>;
  updateSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined>;
  
  // Player methods
  getPlayer(id: string): Promise<Player | undefined>;
  getSessionPlayers(sessionId: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerScore(id: string, score: number): Promise<Player | undefined>;
  
  // Response methods
  createResponse(response: InsertResponse): Promise<PlayerResponse>;
  getPlayerResponses(playerId: string): Promise<PlayerResponse[]>;
  getQuestionResponses(questionId: string): Promise<PlayerResponse[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private quizzes: Map<string, Quiz> = new Map();
  private questions: Map<string, Question> = new Map();
  private sessions: Map<string, QuizSession> = new Map();
  private players: Map<string, Player> = new Map();
  private responses: Map<string, PlayerResponse> = new Map();

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Quiz methods
  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizWithQuestions(id: string): Promise<(Quiz & { questions: Question[] }) | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const questions = await this.getQuestions(id);
    return { ...quiz, questions };
  }

  async createQuiz(quiz: InsertQuiz & { createdBy?: string }): Promise<Quiz> {
    const id = randomUUID();
    const newQuiz: Quiz = { 
      ...quiz, 
      id, 
      createdAt: new Date(),
      createdBy: quiz.createdBy || null
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  // Question methods
  async getQuestions(quizId: string): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(q => q.quizId === quizId)
      .sort((a, b) => a.order - b.order);
  }

  async createQuestion(question: InsertQuestion & { quizId: string }): Promise<Question> {
    const id = randomUUID();
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  // Session methods
  async getSession(id: string): Promise<QuizSession | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByPin(pin: string): Promise<QuizSession | undefined> {
    return Array.from(this.sessions.values()).find(session => session.pin === pin);
  }

  async createSession(session: InsertSession & { hostId?: string }): Promise<QuizSession> {
    const id = randomUUID();
    const pin = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit PIN
    const newSession: QuizSession = {
      ...session,
      id,
      pin,
      status: "waiting",
      currentQuestionIndex: 0,
      hostId: session.hostId || null,
      startedAt: null,
      endedAt: null,
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateSession(id: string, updates: Partial<QuizSession>): Promise<QuizSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getSessionPlayers(sessionId: string): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.sessionId === sessionId)
      .sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const newPlayer: Player = { 
      ...player, 
      id, 
      score: 0,
      joinedAt: new Date()
    };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async updatePlayerScore(id: string, score: number): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, score };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  // Response methods
  async createResponse(response: InsertResponse): Promise<PlayerResponse> {
    const id = randomUUID();
    const newResponse: PlayerResponse = { 
      ...response, 
      id, 
      submittedAt: new Date()
    };
    this.responses.set(id, newResponse);
    return newResponse;
  }

  async getPlayerResponses(playerId: string): Promise<PlayerResponse[]> {
    return Array.from(this.responses.values())
      .filter(response => response.playerId === playerId);
  }

  async getQuestionResponses(questionId: string): Promise<PlayerResponse[]> {
    return Array.from(this.responses.values())
      .filter(response => response.questionId === questionId);
  }
}

export const storage = new MemStorage();
