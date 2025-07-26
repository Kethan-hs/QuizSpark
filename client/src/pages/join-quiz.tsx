import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const joinQuizSchema = z.object({
  pin: z.string().length(6, "PIN must be 6 digits"),
  name: z.string().min(1, "Name is required").max(20, "Name must be 20 characters or less"),
});

export default function JoinQuiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof joinQuizSchema>>({
    resolver: zodResolver(joinQuizSchema),
    defaultValues: {
      pin: "",
      name: "",
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (data: z.infer<typeof joinQuizSchema>) => {
      // First verify the session exists
      const session = await api.getSessionByPin(data.pin);
      
      if (session.status !== "waiting") {
        throw new Error("This quiz session has already started or ended");
      }
      
      // Join the session
      const player = await api.joinSession(session.id, data.name);
      
      return { session, player };
    },
    onSuccess: ({ session }) => {
      toast({
        title: "Joined successfully!",
        description: "Welcome to the quiz. Waiting for the host to start...",
      });
      setLocation(`/lobby/${session.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to join quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof joinQuizSchema>) => {
    joinMutation.mutate(data);
  };

  return (
    <div className="animate-fadeIn">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 relative">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="absolute top-0 right-0 text-gray-400 hover:text-white"
          >
            <X className="text-xl" />
          </Button>
          <h2 className="text-3xl font-bold text-white mb-4">Join Quiz</h2>
          <p className="text-gray-400">Enter the game PIN to join an active quiz session</p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Game PIN</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 6-digit PIN"
                          maxLength={6}
                          className="bg-slate-700 border-slate-600 text-white text-center text-2xl font-bold tracking-widest placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          {...field}
                          onChange={(e) => {
                            // Only allow numbers
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Your Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your display name"
                          className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={joinMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-400 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  {joinMutation.isPending ? "Joining..." : "Join Quiz"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
