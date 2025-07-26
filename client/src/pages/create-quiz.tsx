import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import type { CreateQuizData } from "@/types/quiz";

const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timePerQuestion: z.number().min(5).max(120),
});

const questionSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
});

type QuestionForm = z.infer<typeof questionSchema>;

export default function CreateQuiz() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<QuestionForm[]>([
    {
      questionText: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
    },
  ]);

  const form = useForm<z.infer<typeof createQuizSchema>>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      timePerQuestion: 30,
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: (data: CreateQuizData) => api.createQuiz(data),
    onSuccess: async (quiz) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Quiz created successfully!",
        description: "Your quiz is ready. Starting session...",
      });
      
      try {
        const session = await api.createSession(quiz.id);
        setLocation(`/lobby/${session.id}`);
      } catch (error) {
        console.error("Failed to create session:", error);
        setLocation("/");
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to create quiz",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const onSubmit = (data: z.infer<typeof createQuizSchema>) => {
    // Validate all questions
    const validQuestions = questions.filter(q => 
      q.questionText.trim() && q.optionA.trim() && q.optionB.trim()
    );

    if (validQuestions.length === 0) {
      toast({
        title: "No valid questions",
        description: "Please add at least one complete question.",
        variant: "destructive",
      });
      return;
    }

    const quizData: CreateQuizData = {
      ...data,
      questions: validQuestions.map((q, index) => ({
        ...q,
        order: index + 1,
      })),
    };

    createQuizMutation.mutate(quizData);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Create New Quiz</h2>
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="text-gray-400 hover:text-white"
        >
          <X className="text-xl" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quiz Settings */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700/50 sticky top-24">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quiz Settings</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Quiz Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter quiz title"
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your quiz"
                            rows={3}
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timePerQuestion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300">Time per Question</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="45">45 seconds</SelectItem>
                            <SelectItem value="60">60 seconds</SelectItem>
                            <SelectItem value="90">90 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={createQuizMutation.isPending}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    {createQuizMutation.isPending ? "Creating..." : "Save & Start Session"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Questions</h3>
              <Button
                onClick={addQuestion}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-400">Question {index + 1}</span>
                    {questions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Question Text</label>
                    <Input
                      placeholder="Enter your question"
                      value={question.questionText}
                      onChange={(e) => updateQuestion(index, "questionText", e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Answer Options (select correct answer)</label>
                    <RadioGroup
                      value={question.correctAnswer}
                      onValueChange={(value) => updateQuestion(index, "correctAnswer", value)}
                      className="space-y-3"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="A" id={`${index}-A`} />
                          <Input
                            placeholder="Option A"
                            value={question.optionA}
                            onChange={(e) => updateQuestion(index, "optionA", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="B" id={`${index}-B`} />
                          <Input
                            placeholder="Option B"
                            value={question.optionB}
                            onChange={(e) => updateQuestion(index, "optionB", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="C" id={`${index}-C`} />
                          <Input
                            placeholder="Option C (optional)"
                            value={question.optionC || ""}
                            onChange={(e) => updateQuestion(index, "optionC", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          />
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="D" id={`${index}-D`} />
                          <Input
                            placeholder="Option D (optional)"
                            value={question.optionD || ""}
                            onChange={(e) => updateQuestion(index, "optionD", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-gray-400">Select the radio button next to the correct answer</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
