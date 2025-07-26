import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Home, Download, RotateCcw, Crown, Trophy } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FinalResultsProps {
  params: { sessionId: string };
}

export default function FinalResults({ params }: FinalResultsProps) {
  const [, setLocation] = useLocation();
  
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
  });

  if (!session || !quiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-12 bg-slate-700 rounded animate-pulse"></div>
        <div className="h-32 bg-slate-700 rounded-2xl animate-pulse"></div>
        <div className="h-48 bg-slate-700 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const winner = players[0];
  const averageScore = players.length > 0 
    ? Math.round(players.reduce((sum, p) => sum + (p.score || 0), 0) / players.length) 
    : 0;

  const playAgain = async () => {
    try {
      const newSession = await api.createSession(quiz.id);
      setLocation(`/lobby/${newSession.id}`);
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Quiz Complete!
          </h2>
          <p className="text-xl text-gray-400">Final results for {quiz.title}</p>
        </div>
        
        {/* Celebration Animation */}
        <div className="relative">
          <div className="animate-bounce-slow text-6xl">🎉</div>
        </div>
      </div>

      {/* Winner Spotlight */}
      {winner && (
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-400/20 border-yellow-500/30">
          <CardContent className="p-8 text-center space-y-4">
            <Crown className="text-yellow-500 text-4xl mx-auto" />
            <h3 className="text-3xl font-bold text-white">
              🏆 Winner: {winner.name}
            </h3>
            <p className="text-2xl text-yellow-400 font-bold">{winner.score || 0} points</p>
            <p className="text-gray-400">
              Congratulations on your victory!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quiz Statistics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white">{players.length}</div>
            <p className="text-gray-400">Total Players</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white">{averageScore}</div>
            <p className="text-gray-400">Average Score</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white">{quiz.questions.length}</div>
            <p className="text-gray-400">Total Questions</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50 text-center">
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-white">{quiz.timePerQuestion}s</div>
            <p className="text-gray-400">Per Question</p>
          </CardContent>
        </Card>
      </div>

      {/* Final Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="border-b border-slate-700/50 pb-4 mb-6">
            <h3 className="text-2xl font-bold text-white">Final Standings</h3>
          </div>
          <div className="space-y-4">
            {players.map((player, index) => {
              const rank = index + 1;
              const isWinner = rank === 1;
              
              return (
                <div key={player.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className={`w-12 h-12 ${isWinner ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : rank === 2 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : rank === 3 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-slate-600'} rounded-full flex items-center justify-center`}>
                        <span className="text-white font-bold">{rank}</span>
                      </div>
                      {isWinner && (
                        <Crown className="absolute -top-2 -right-2 text-yellow-500 text-xl" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white flex items-center">
                        {player.name}
                        {isWinner && <Trophy className="ml-2 h-5 w-5 text-yellow-500" />}
                      </h4>
                      <p className="text-gray-400">Final score</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{player.score || 0}</p>
                    <p className="text-gray-400">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => setLocation("/")}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          <Home className="mr-2 h-5 w-5" />
          Back to Dashboard
        </Button>
        <Button
          variant="outline"
          className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200"
        >
          <Download className="mr-2 h-5 w-5" />
          Export Results
        </Button>
        <Button
          onClick={playAgain}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Play Again
        </Button>
      </div>
    </div>
  );
}
