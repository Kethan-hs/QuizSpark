import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface QuizTimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  className?: string;
}

export function QuizTimer({ duration, onTimeUp, isActive, className }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);

  useEffect(() => {
    setTimeRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const isLowTime = timeRemaining <= 10;
  
  return (
    <div className={cn("text-center", className)}>
      <div 
        className={cn(
          "text-3xl font-bold transition-colors animate-countdown",
          isLowTime ? "text-red-500" : "text-yellow-500"
        )}
      >
        {timeRemaining}
      </div>
      <p className="text-sm text-gray-400">seconds left</p>
    </div>
  );
}
