import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuizTimer } from "@/components/quiz-timer";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ActiveQuizProps {
  params: { sessionId: string };
}

export default function ActiveQuiz({ params }: ActiveQuizProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  const { data: session } = useQuery({
    queryKey: ["/api/sessions", params.sessionId],
    queryFn: () => api.getSession(params.sessionId),
    refetchInterval: 1000, // Poll for session updates
  });

  const { data: quiz } = useQuery({
    queryKey: ["/api/quizzes", session?.quizId],
    queryFn: () => session ? api.getQuiz(session.quizId) : null,
    enabled: !!session?.quizId,
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/sessions", params.sessionId, "players"],
    queryFn: () => api.getSessionPlayers(params.sessionId),
    refetchInterval: 2000,
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (answer: string) => {
      if (!currentQuestion || !currentPlayerId) throw new Error("Missing data");
      
      const isCorrect = answer === currentQuestion.correctAnswer;
      const responseTime = quiz!.timePerQuestion * 1000 - timeRemaining * 1000; // in milliseconds
      
      await api.submitResponse({
        playerId: currentPlayerId,
        questionId: currentQuestion.id,
        selectedAnswer: answer,
        isCorrect,
        responseTime,
      });

      // Update player score if correct
      if (isCorrect && currentPlayerId) {
        const currentPlayer = players.find(p => p.id === currentPlayerId);
        if (currentPlayer) {
          const newScore = (currentPlayer.score || 0) + 100; // Basic scoring
          await api.updatePlayerScore(currentPlayerId, newScore);
        }
      }
    },
    onSuccess: () => {
      setHasAnswered(true);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", params.sessionId, "players"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit answer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [timeRemaining, setTimeRemaining] = useState(0);

  // Get current question
  const currentQuestion = quiz?.questions[session?.currentQuestionIndex || 0];
  const progress = session && quiz ? ((session.currentQuestionIndex || 0) + 1) / quiz.questions.length * 100 : 0;

  // Auto-redirect based on session status
  useEffect(() => {
    if (session?.status === "completed") {
      setLocation(`/results/${params.sessionId}`);
    }
  }, [session?.status, params.sessionId, setLocation]);

  // Initialize player ID (in real app, this would come from auth/context)
  useEffect(() => {
    if (players.length > 0 && !currentPlayerId) {
      // For demo purposes, assume we're the first player
      // In real app, this would be stored in context/localStorage
      const playerName = localStorage.getItem("playerName");
      const player = players.find(p => p.name === playerName) || players[0];
      setCurrentPlayerId(player.id);
    }
  }, [players, currentPlayerId]);

  // Reset answer state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    setTimeRemaining(quiz?.timePerQuestion || 30);
  }, [session?.currentQuestionIndex, quiz?.timePerQuestion]);

  const handleTimeUp = () => {
    if (!hasAnswered) {
      toast({
        title: "Time's up!",
        description: "Moving to leaderboard...",
      });
      setTimeout(() => {
        setLocation(`/leaderboard/${params.sessionId}`);
      }, 1000);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (hasAnswered) return;
    
    setSelectedAnswer(answer);
    submitAnswerMutation.mutate(answer);
  };

  const getAnswerOptions = (question: typeof currentQuestion) => {
    if (!question) return [];
    
    const options = [
      { key: "A", text: question.optionA, color: "bg-indigo-500 hover:bg-indigo-600" },
      { key: "B", text: question.optionB, color: "bg-green-500 hover:bg-green-600" },
    ];
    
    if (question.optionC) {
      options.push({ key: "C", text: question.optionC, color: "bg-yellow-500 hover:bg-yellow-600" });
    }
    
    if (question.optionD) {
      options.push({ key: "D", text: question.optionD, color: "bg-red-500 hover:bg-red-600" });
    }
    
    return options;
  };

  if (!session || !quiz || !currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-20 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-4 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-700 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Quiz Header */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
            <p className="text-gray-400">
              Question {(session.currentQuestionIndex || 0) + 1} of {quiz.questions.length}
            </p>
          </div>
          <QuizTimer
            duration={quiz.timePerQuestion}
            onTimeUp={handleTimeUp}
            isActive={!hasAnswered}
            className="text-right"
          />
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Progress value={progress} className="w-full bg-slate-700 h-2" />

      {/* Question Display */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50">
        <CardContent className="p-8 space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
            {currentQuestion.questionText}
          </h2>
          
          {/* Answer Options */}
          <div className="grid md:grid-cols-2 gap-4">
            {getAnswerOptions(currentQuestion).map((option) => (
              <Button
                key={option.key}
                onClick={() => handleAnswerSelect(option.key)}
                disabled={hasAnswered}
                className={cn(
                  "h-auto p-6 text-left transition-all duration-200 transform hover:scale-105 border-2 border-slate-600",
                  option.color,
                  selectedAnswer === option.key && "ring-2 ring-white ring-offset-2 ring-offset-slate-700",
                  hasAnswered && "opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">
                    {option.key}
                  </div>
                  <span className="text-white font-medium">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>

          {/* Answer Status */}
          {hasAnswered && (
            <div className="text-center animate-slideIn">
              <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg">
                <span>✓</span>
                <span>Answer submitted! Waiting for other players...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-white">
              {players.filter(p => hasAnswered).length}
            </div>
            <p className="text-gray-400">Answered</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-white">{players.length}</div>
            <p className="text-gray-400">Players Online</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-white">
              {Math.round((quiz.timePerQuestion - timeRemaining) * 10) / 10}s
            </div>
            <p className="text-gray-400">Your Response Time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
