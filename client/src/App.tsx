import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import CreateQuiz from "@/pages/create-quiz";
import JoinQuiz from "@/pages/join-quiz";
import QuizLobby from "@/pages/quiz-lobby";
import ActiveQuiz from "@/pages/active-quiz";
import Leaderboard from "@/pages/leaderboard";
import FinalResults from "@/pages/final-results";
import NotFound from "@/pages/not-found";
import { PuzzleIcon } from "lucide-react";

function Header() {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <PuzzleIcon className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              i-Quiz
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/create" component={CreateQuiz} />
      <Route path="/join" component={JoinQuiz} />
      <Route path="/lobby/:sessionId" component={QuizLobby} />
      <Route path="/quiz/:sessionId" component={ActiveQuiz} />
      <Route path="/leaderboard/:sessionId" component={Leaderboard} />
      <Route path="/results/:sessionId" component={FinalResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
