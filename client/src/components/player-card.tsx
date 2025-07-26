import { cn } from "@/lib/utils";
import type { Player } from "@/types/quiz";

interface PlayerCardProps {
  player: Player;
  rank?: number;
  className?: string;
}

export function PlayerCard({ player, rank, className }: PlayerCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-indigo-500 to-purple-500",
      "from-green-500 to-emerald-400",
      "from-yellow-500 to-orange-400",
      "from-red-500 to-pink-500",
      "from-blue-500 to-cyan-400",
      "from-purple-500 to-indigo-500",
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className={cn("bg-slate-700/50 rounded-lg p-4 text-center", className)}>
      <div className={cn(
        "w-12 h-12 bg-gradient-to-r rounded-full flex items-center justify-center mx-auto mb-2",
        getAvatarColor(player.name)
      )}>
        <span className="text-white font-bold">{getInitials(player.name)}</span>
      </div>
      <p className="text-white font-medium">{player.name}</p>
      {rank && (
        <p className="text-sm text-gray-400">#{rank}</p>
      )}
      {player.score !== null && (
        <p className="text-sm text-gray-400">{player.score} pts</p>
      )}
    </div>
  );
}
