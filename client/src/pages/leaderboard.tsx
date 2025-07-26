import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Trophy, Crown } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LeaderboardProps {
  params: { sessionId: string };
}

export default function Leaderboard({ params }: LeaderboardProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { data: session } = useQuery({
    queryKey: ["/api/sessions", params.sessionId],
    queryFn: () => api.getSession(params.sessionId),
  });

  const { data: quiz } = useQuery({
    queryKey: ["/api/quizzes", session?.quizId],
    queryFn: () => session ? api.getQuiz(session.quizId) : null,
    enabled: !!session?.quizId,
  });

  const { data: players = [] } = useQuery({
    queryKey: ["/api/sessions", params.sessionId, "players"],
    queryFn: () => api.getSessionPlayers(params.sessionId),
    refetchInterval: 1000,
  });

  const nextQuestionMutation = useMutation({
    mutationFn: () => {
      const nextIndex = (session?.currentQuestionIndex || 0) + 1;
      if (quiz && nextIndex >= quiz.questions.length) {
        // End quiz
        return api.updateSession(params.sessionId, { 
          status: "completed",
          endedAt: new Date(),
        });
      } else {
        // Next question
        return api.updateSession(params.sessionId, { 
          currentQuestionIndex: nextIndex 
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", params.sessionId] });
      const nextIndex = (session?.currentQuestionIndex || 0) + 1;
      if (quiz && nextIndex >= quiz.questions.length) {
        setLocation(`/results/${params.sessionId}`);
      } else {
        setLocation(`/quiz/${params.sessionId}`);
      }
    },
  });

  // Auto-advance after 5 seconds (host feature)
  useEffect(() => {
    const timer = setTimeout(() => {
      nextQuestionMutation.mutate();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!session || !quiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-12 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-64 bg-slate-700 rounded-2xl animate-pulse"></div>
        <div className="h-48 bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const currentQuestionNumber = (session.currentQuestionIndex || 0) + 1;
  const isLastQuestion = currentQuestionNumber >= quiz.questions.length;
  
  // Get top 3 for podium
  const topThree = players.slice(0, 3);
  const [first, second, third] = topThree;

  const getPodiumPosition = (rank: number) => {
    switch (rank) {
      case 1: return "order-2 md:order-2 md:-translate-y-8";
      case 2: return "order-1 md:order-1 md:-translate-y-4";
      case 3: return "order-3 md:order-3";
      default: return "";
    }
  };

  const getPodiumColor = (rank: number) => {
    switch (rank) {
      case 1: return "from-yellow-500 to-yellow-600 border-yellow-400/50";
      case 2: return "from-gray-400 to-gray-500 border-gray-400/50";
      case 3: return "from-amber-600 to-amber-700 border-amber-500/50";
      default: return "from-slate-600 to-slate-700 border-slate-500/50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
          <Trophy className="inline mr-4 text-yellow-500" />
          Leaderboard
        </h2>
        <p className="text-xl text-gray-400">
          Current standings after question {currentQuestionNumber}
        </p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {topThree.map((player, index) => {
            const rank = index + 1;
            return (
              <div key={player.id} className={getPodiumPosition(rank)}>
                <Card className={`bg-gradient-to-br ${getPodiumColor(rank)} text-center transform`}>
                  <CardContent className="p-6">
                    {rank === 1 ? (
                      <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="text-white text-2xl" />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 bg-gradient-to-r ${rank === 2 ? 'from-gray-400 to-gray-500' : 'from-amber-500 to-amber-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <span className="text-white font-bold text-xl">{rank}</span>
                      </div>
                    )}
                    <h3 className={`${rank === 1 ? 'text-2xl' : 'text-xl'} font-bold text-white`}>
                      {player.name}
                    </h3>
                    <p className={`${rank === 1 ? 'text-3xl' : 'text-2xl'} font-bold mt-2 ${rank === 1 ? 'text-white' : rank === 2 ? 'text-gray-200' : 'text-amber-200'}`}>
                      {player.score || 0}
                    </p>
                    <p className={`text-sm ${rank === 1 ? 'text-yellow-100' : rank === 2 ? 'text-gray-300' : 'text-amber-300'}`}>
                      points
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="border-b border-slate-700/50 pb-4 mb-6">
            <h3 className="text-xl font-semibold text-white">All Players</h3>
          </div>
          <div className="space-y-3">
            {players.map((player, index) => {
              const rank = index + 1;
              return (
                <div key={player.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-8 h-8 ${rank <= 3 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 'bg-slate-600'} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{rank}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white flex items-center">
                        {player.name}
                        {rank === 1 && <Crown className="ml-2 h-4 w-4 text-yellow-500" />}
                      </h4>
                      <p className="text-sm text-gray-400">
                        Score: {player.score || 0} points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{player.score || 0}</p>
                    <p className="text-sm text-gray-400">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <div className="text-center">
        <Button
          onClick={() => nextQuestionMutation.mutate()}
          disabled={nextQuestionMutation.isPending}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          <ArrowRight className="mr-2 h-5 w-5" />
          {nextQuestionMutation.isPending 
            ? "Loading..." 
            : isLastQuestion 
              ? "View Final Results" 
              : "Next Question"
          }
        </Button>
        <p className="text-sm text-gray-400 mt-2">Auto-advancing in 5 seconds...</p>
      </div>
    </div>
  );
}
