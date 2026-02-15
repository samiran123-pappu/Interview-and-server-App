"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LANGUAGES, type LanguageId } from "@/constants/languages";
import { SEED_QUESTIONS } from "@/data/seed-questions";
import { executeCode } from "@/lib/piston";
import { useState, useCallback, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  AlertCircleIcon, BookIcon, LightbulbIcon, PlayIcon, RotateCcwIcon,
  Loader2Icon, TerminalIcon, CheckCircle2Icon, XCircleIcon,
  ChevronDownIcon, DatabaseIcon, SparklesIcon, CodeIcon,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Editor from "@monaco-editor/react";
import type { Doc } from "../../convex/_generated/dataModel";

type Question = Doc<"questions">;

// Supported starter code languages
const STARTER_CODE_LANGS = ["javascript", "python", "java", "cpp", "typescript", "go"] as const;
type StarterLang = (typeof STARTER_CODE_LANGS)[number];

function getStarterCode(question: Question, langId: LanguageId): string {
  if (STARTER_CODE_LANGS.includes(langId as StarterLang)) {
    return question.starterCode[langId as StarterLang] || getDefaultTemplate(langId);
  }
  return getDefaultTemplate(langId);
}

function getDefaultTemplate(langId: LanguageId): string {
  const lang = LANGUAGES.find((l) => l.id === langId);
  const comment = langId === "python" ? "#" : "//";
  return `${comment} ${lang?.name ?? langId} — Write your code here\n\n`;
}

// ── Difficulty colors ─────────────────────────────────────────────────
const DIFF_COLORS: Record<string, string> = {
  easy: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  hard: "bg-red-500/15 text-red-500 border-red-500/30",
};

// ── Categories for filter ─────────────────────────────────────────────
const ALL_CATEGORIES = [
  "All", "Arrays", "Strings", "Two Pointers", "Sliding Window", "Stack",
  "Linked List", "Binary Search", "Trees", "Graphs", "Dynamic Programming",
  "Math", "Sorting", "Backtracking", "Greedy", "Hash Map", "Heap",
];

function CodeEditor() {
  // ── Convex ──────────────────────────────────────────────────────────
  const questions = useQuery(api.questions.getAll);
  const seedMutation = useMutation(api.questions.seed);

  // ── Local state ─────────────────────────────────────────────────────
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [code, setCode] = useState("");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [runSuccess, setRunSuccess] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "output">("description");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [isSeeding, setIsSeeding] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const codeRef = useRef(code);
  codeRef.current = code;

  // ── Derived data ────────────────────────────────────────────────────
  const filteredQuestions = (questions ?? []).filter(
    (q: Question) => categoryFilter === "All" || q.category === categoryFilter
  );

  const selectedQuestion =
    filteredQuestions.find((q: Question) => q._id === selectedQuestionId) ?? filteredQuestions[0] ?? null;

  // ── Handlers ────────────────────────────────────────────────────────
  const handleSeed = useCallback(async () => {
    setIsSeeding(true);
    try {
      await seedMutation({ questions: SEED_QUESTIONS });
    } catch {
      setOutput("Failed to seed questions. Check console for details.");
    } finally {
      setIsSeeding(false);
    }
  }, [seedMutation]);

  const handleQuestionChange = useCallback(
    (qId: string) => {
      setSelectedQuestionId(qId);
      const q = filteredQuestions.find((q: Question) => q._id === qId);
      if (q) setCode(getStarterCode(q, language));
      setOutput("");
      setRunSuccess(null);
      setShowHints(false);
    },
    [filteredQuestions, language]
  );

  const handleLanguageChange = useCallback(
    (newLang: LanguageId) => {
      setLanguage(newLang);
      if (selectedQuestion) setCode(getStarterCode(selectedQuestion, newLang));
    },
    [selectedQuestion]
  );

  const handleReset = useCallback(() => {
    if (selectedQuestion) setCode(getStarterCode(selectedQuestion, language));
    setOutput("");
    setRunSuccess(null);
  }, [selectedQuestion, language]);

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setActiveTab("output");
    setRunSuccess(null);
    setOutput("Running...\n");
    try {
      const lang = LANGUAGES.find((l) => l.id === language)!;
      const result = await executeCode(lang.pistonId, lang.pistonVersion, codeRef.current, stdin);
      const out = (result.stdout + result.stderr).trim() || "No output";
      setOutput(out);
      setRunSuccess(result.code === 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setOutput(`Execution Error: ${msg}`);
      setRunSuccess(false);
    } finally {
      setIsRunning(false);
    }
  }, [language, stdin]);

  // ── Initialize code when question loads ────────────────────────────
  const prevQId = useRef<string | null>(null);
  if (selectedQuestion && selectedQuestion._id !== prevQId.current) {
    prevQId.current = selectedQuestion._id;
    if (!code || code === getDefaultTemplate(language)) {
      setCode(getStarterCode(selectedQuestion, language));
    }
  }

  // ── Empty state: no questions ───────────────────────────────────────
  if (questions !== undefined && questions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <DatabaseIcon className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-xl">No Coding Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Seed the database with 150 interview questions covering Arrays, Trees, DP, Graphs, and more.
            </p>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={handleSeed} disabled={isSeeding} size="lg">
              {isSeeding ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                <>
                  <SparklesIcon className="mr-2 h-4 w-4" />
                  Load 150 Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Loading state ───────────────────────────────────────────────────
  if (questions === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ResizablePanelGroup orientation="vertical" className="h-full">
      {/* ── TOP: Question Panel ──────────────────────────────────────── */}
      <ResizablePanel defaultSize={35} minSize={15}>
        <div className="h-full flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30 flex-wrap">
            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-35 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Question selector */}
            <Select
              value={selectedQuestion?._id ?? ""}
              onValueChange={handleQuestionChange}
            >
              <SelectTrigger className="w-55 h-8 text-xs">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent className="max-h-75">
                {filteredQuestions.map((q: Question) => (
                  <SelectItem key={q._id} value={q._id} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          q.difficulty === "easy"
                            ? "bg-emerald-500"
                            : q.difficulty === "medium"
                              ? "bg-amber-500"
                              : "bg-red-500"
                        }`}
                      />
                      {q.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty badge */}
            {selectedQuestion && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${DIFF_COLORS[selectedQuestion.difficulty]}`}
              >
                {selectedQuestion.difficulty}
              </span>
            )}

            {selectedQuestion && (
              <Badge variant="outline" className="text-[10px] h-5">
                {selectedQuestion.category}
              </Badge>
            )}

            <div className="ml-auto text-[10px] text-muted-foreground">
              {filteredQuestions.length} questions
            </div>
          </div>

          {/* Tabs: Description | Output */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "description"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookIcon className="inline-block h-3.5 w-3.5 mr-1" />
              Description
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`px-4 py-1.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === "output"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <TerminalIcon className="inline-block h-3.5 w-3.5 mr-1" />
              Output
              {runSuccess !== null && (
                <span className="ml-1">
                  {runSuccess ? (
                    <CheckCircle2Icon className="inline h-3 w-3 text-emerald-500" />
                  ) : (
                    <XCircleIcon className="inline h-3 w-3 text-red-500" />
                  )}
                </span>
              )}
            </button>
          </div>

          {/* Tab content */}
          <ScrollArea className="flex-1">
            {activeTab === "description" && selectedQuestion ? (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{selectedQuestion.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedQuestion.description}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Examples
                  </h4>
                  {selectedQuestion.examples.map((ex: { input: string; output: string; explanation?: string }, i: number) => (
                    <div key={i} className="bg-muted/40 rounded-lg p-3 text-xs font-mono space-y-0.5">
                      <div>
                        <span className="text-muted-foreground">Input: </span>
                        {ex.input}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output: </span>
                        <span className="text-emerald-500 font-semibold">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-muted-foreground italic mt-1">
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                {selectedQuestion.constraints && selectedQuestion.constraints.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Constraints
                    </h4>
                    <ul className="space-y-0.5">
                      {selectedQuestion.constraints.map((c: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <AlertCircleIcon className="h-3 w-3 mt-0.5 shrink-0 text-blue-500" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Hints */}
                {selectedQuestion.hints && selectedQuestion.hints.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium"
                    >
                      <LightbulbIcon className="h-3.5 w-3.5" />
                      {showHints ? "Hide Hints" : "Show Hints"}
                      <ChevronDownIcon
                        className={`h-3 w-3 transition-transform ${showHints ? "rotate-180" : ""}`}
                      />
                    </button>
                    {showHints && (
                      <ul className="mt-2 space-y-1">
                        {selectedQuestion.hints.map((h: string, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground bg-amber-500/5 rounded p-2 border border-amber-500/10">
                            <span className="font-semibold text-amber-500">Hint {i + 1}:</span> {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : activeTab === "output" ? (
              <div className="p-4 space-y-3">
                {/* stdin input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Standard Input (stdin)
                  </label>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    placeholder="Optional: Enter input for your program..."
                    className="w-full h-16 bg-muted/40 rounded-md p-2 text-xs font-mono resize-none border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {/* Output */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Output
                    </label>
                    {runSuccess !== null && (
                      <span className={`text-[10px] font-medium ${runSuccess ? "text-emerald-500" : "text-red-500"}`}>
                        {runSuccess ? "Exited with code 0" : "Runtime error"}
                      </span>
                    )}
                  </div>
                  <pre
                    className={`w-full min-h-20 max-h-50 overflow-auto rounded-md p-3 text-xs font-mono border ${
                      runSuccess === false
                        ? "bg-red-500/5 border-red-500/20 text-red-400"
                        : "bg-zinc-950 border-zinc-800 text-zinc-200"
                    }`}
                  >
                    {output || "Run your code to see output here..."}
                  </pre>
                </div>
              </div>
            ) : null}
            <ScrollBar />
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* ── BOTTOM: Code Editor ──────────────────────────────────────── */}
      <ResizablePanel defaultSize={65} minSize={25}>
        <div className="h-full flex flex-col">
          {/* Editor toolbar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
            <CodeIcon className="h-4 w-4 text-muted-foreground" />

            {/* Language selector */}
            <Select value={language} onValueChange={(v) => handleLanguageChange(v as LanguageId)}>
              <SelectTrigger className="w-37.5 h-8 text-xs">
                <SelectValue>
                  <span className="flex items-center gap-1.5">
                    <span>{LANGUAGES.find((l) => l.id === language)?.emoji}</span>
                    {LANGUAGES.find((l) => l.id === language)?.name}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-75">
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.id} value={lang.id} className="text-xs">
                    <span className="flex items-center gap-2">
                      <span>{lang.emoji}</span>
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1" />

            {/* Reset button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleReset}
            >
              <RotateCcwIcon className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>

            {/* Run button */}
            <Button
              size="sm"
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleRunCode}
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2Icon className="h-3.5 w-3.5 mr-1 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <PlayIcon className="h-3.5 w-3.5 mr-1" />
                  Run Code
                </>
              )}
            </Button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={LANGUAGES.find((l) => l.id === language)?.monacoId ?? "plaintext"}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
                wordWrap: "on",
                wrappingIndent: "indent",
                tabSize: 2,
                bracketPairColorization: { enabled: true },
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                folding: true,
                lineDecorationsWidth: 5,
                renderLineHighlight: "all",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
              }}
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default CodeEditor;