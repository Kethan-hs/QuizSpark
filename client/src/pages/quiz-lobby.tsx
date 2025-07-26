import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Clock, List, Copy } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerCard } from "@/components/player-card";
import { useToast } from "@/hooks/use-toast";

interface QuizLobbyProps {
  params: { sessionId: string };
}

export default function QuizLobby({ params }: QuizLobbyProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/sessions", params.sessionId],
    queryFn: () => api.getSession(params.sessionId),
    refetchInterval: 2000, // Poll every 2 seconds for session updates
  });

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ["/api/quizzes", session?.quizId],
    queryFn: () => session ? api.getQuiz(session.quizId) : null,
    enabled: !!session?.quizId,
  });

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["/api/sessions", params.sessionId, "players"],
    queryFn: () => api.getSessionPlayers(params.sessionId),
    refetchInterval: 1000, // Poll every second for new players
  });

  const startQuizMutation = useMutation({
    mutationFn: () => api.updateSession(params.sessionId, { 
      status: "active",
      startedAt: new Date(),
      currentQuestionIndex: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", params.sessionId] });
      setLocation(`/quiz/${params.sessionId}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to start quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-redirect if quiz has started
  useEffect(() => {
    if (session?.status === "active") {
      setLocation(`/quiz/${params.sessionId}`);
    }
  }, [session?.status, params.sessionId, setLocation]);

  const copyPin = () => {
    if (session?.pin) {
      navigator.clipboard.writeText(session.pin);
      toast({
        title: "PIN copied!",
        description: "Game PIN has been copied to clipboard",
      });
    }
  };

  if (sessionLoading || quizLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-12 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-32 bg-slate-700 rounded-2xl animate-pulse"></div>
        <div className="h-48 bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  if (!session || !quiz) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Session not found</h2>
        <p className="text-gray-400">The quiz session you're looking for doesn't exist.</p>
        <Button onClick={() => setLocation("/")} className="bg-indigo-500 hover:bg-indigo-600">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="text-center space-y-8">
        {/* Quiz Info */}
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">{quiz.title}</h2>
          <p className="text-xl text-gray-400">{quiz.description || "Get ready to test your knowledge!"}</p>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              {quiz.timePerQuestion} seconds per question
            </span>
            <span className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              {quiz.questions.length} questions
            </span>
          </div>
        </div>

        {/* Game PIN Display */}
        <Card className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30">
          <CardContent className="p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Game PIN</h3>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-6xl font-bold text-white tracking-wider">{session.pin}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPin}
                className="text-gray-400 hover:text-white"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-gray-400 mt-4">Share this PIN with players to join</p>
          </CardContent>
        </Card>

        {/* Connected Players */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-white">Players Joined</h3>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              {playersLoading ? (
                <div className="grid md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-700 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : players.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-4 gap-4">
                    {players.map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                  <div className="mt-6 text-center">
                    <span className="text-2xl font-bold text-white">{players.length}</span>
                    <span className="text-gray-400 ml-2">players connected</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Waiting for players to join...</p>
                  <p className="text-sm text-gray-500 mt-2">Share the PIN above to invite players</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {players.length > 0 && (
            <Button
              onClick={() => startQuizMutation.mutate()}
              disabled={startQuizMutation.isPending}
              className="bg-gradient-to-r from-green-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              {startQuizMutation.isPending ? "Starting..." : "Start Quiz"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
