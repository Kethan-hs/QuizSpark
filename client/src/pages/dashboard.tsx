import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Users } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: () => api.getQuizzes(),
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="h-12 bg-slate-700 rounded animate-pulse"></div>
          <div className="h-6 bg-slate-700 rounded animate-pulse max-w-2xl mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="h-64 bg-slate-700 rounded-2xl animate-pulse"></div>
          <div className="h-64 bg-slate-700 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Welcome to i-Quiz
        </h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Create engaging real-time quizzes and challenge players worldwide
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Create Quiz Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto">
              <Plus className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Create Quiz</h3>
              <p className="text-gray-400">Design your own interactive quiz with multiple choice questions</p>
            </div>
            <Button 
              onClick={() => setLocation("/create")}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Start Creating
            </Button>
          </CardContent>
        </Card>

        {/* Join Quiz Card */}
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="text-white text-2xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Join Quiz</h3>
              <p className="text-gray-400">Enter a game PIN to join an active quiz session</p>
            </div>
            <Button 
              onClick={() => setLocation("/join")}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              Join Game
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Quizzes */}
      {quizzes.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white">Your Recent Quizzes</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quizzes.slice(0, 6).map((quiz: any) => (
              <Card key={quiz.id} className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-white">{quiz.title}</h4>
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full">
                      {quiz.timePerQuestion}s per Q
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{quiz.description || "No description provided"}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created recently</span>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        const session = await api.createSession(quiz.id);
                        setLocation(`/lobby/${session.id}`);
                      } catch (error) {
                        console.error("Failed to create session:", error);
                      }
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Start Session
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
