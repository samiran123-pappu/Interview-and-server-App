// ── Language Definitions ──────────────────────────────────────────────
// Each language maps to its Monaco editor ID and Piston API execution ID.

export type LanguageId =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "c"
  | "csharp"
  | "go"
  | "rust"
  | "ruby"
  | "swift"
  | "kotlin"
  | "php"
  | "scala"
  | "r"
  | "perl"
  | "lua"
  | "bash"
  | "dart"
  | "haskell";

export interface Language {
  id: LanguageId;
  name: string;
  monacoId: string;
  pistonId: string;
  pistonVersion: string;
  emoji: string;
  extension: string;
}

export const LANGUAGES: Language[] = [
  {
    id: "javascript",
    name: "JavaScript",
    monacoId: "javascript",
    pistonId: "javascript",
    pistonVersion: "18.15.0",
    emoji: "🟨",
    extension: ".js",
  },
  {
    id: "typescript",
    name: "TypeScript",
    monacoId: "typescript",
    pistonId: "typescript",
    pistonVersion: "5.0.3",
    emoji: "🔷",
    extension: ".ts",
  },
  {
    id: "python",
    name: "Python",
    monacoId: "python",
    pistonId: "python",
    pistonVersion: "3.10.0",
    emoji: "🐍",
    extension: ".py",
  },
  {
    id: "java",
    name: "Java",
    monacoId: "java",
    pistonId: "java",
    pistonVersion: "15.0.2",
    emoji: "☕",
    extension: ".java",
  },
  {
    id: "cpp",
    name: "C++",
    monacoId: "cpp",
    pistonId: "c++",
    pistonVersion: "10.2.0",
    emoji: "⚡",
    extension: ".cpp",
  },
  {
    id: "c",
    name: "C",
    monacoId: "c",
    pistonId: "c",
    pistonVersion: "10.2.0",
    emoji: "🔵",
    extension: ".c",
  },
  {
    id: "csharp",
    name: "C#",
    monacoId: "csharp",
    pistonId: "csharp",
    pistonVersion: "6.12.0",
    emoji: "💜",
    extension: ".cs",
  },
  {
    id: "go",
    name: "Go",
    monacoId: "go",
    pistonId: "go",
    pistonVersion: "1.16.2",
    emoji: "🐹",
    extension: ".go",
  },
  {
    id: "rust",
    name: "Rust",
    monacoId: "rust",
    pistonId: "rust",
    pistonVersion: "1.68.2",
    emoji: "🦀",
    extension: ".rs",
  },
  {
    id: "ruby",
    name: "Ruby",
    monacoId: "ruby",
    pistonId: "ruby",
    pistonVersion: "3.0.1",
    emoji: "💎",
    extension: ".rb",
  },
  {
    id: "swift",
    name: "Swift",
    monacoId: "swift",
    pistonId: "swift",
    pistonVersion: "5.3.3",
    emoji: "🦅",
    extension: ".swift",
  },
  {
    id: "kotlin",
    name: "Kotlin",
    monacoId: "kotlin",
    pistonId: "kotlin",
    pistonVersion: "1.8.20",
    emoji: "🟣",
    extension: ".kt",
  },
  {
    id: "php",
    name: "PHP",
    monacoId: "php",
    pistonId: "php",
    pistonVersion: "8.2.3",
    emoji: "🐘",
    extension: ".php",
  },
  {
    id: "scala",
    name: "Scala",
    monacoId: "scala",
    pistonId: "scala",
    pistonVersion: "3.2.2",
    emoji: "🔴",
    extension: ".scala",
  },
  {
    id: "r",
    name: "R",
    monacoId: "r",
    pistonId: "r",
    pistonVersion: "4.1.1",
    emoji: "📊",
    extension: ".r",
  },
  {
    id: "perl",
    name: "Perl",
    monacoId: "perl",
    pistonId: "perl",
    pistonVersion: "5.36.0",
    emoji: "🐪",
    extension: ".pl",
  },
  {
    id: "lua",
    name: "Lua",
    monacoId: "lua",
    pistonId: "lua",
    pistonVersion: "5.4.4",
    emoji: "🌙",
    extension: ".lua",
  },
  {
    id: "bash",
    name: "Bash",
    monacoId: "shell",
    pistonId: "bash",
    pistonVersion: "5.2.0",
    emoji: "🖥️",
    extension: ".sh",
  },
  {
    id: "dart",
    name: "Dart",
    monacoId: "dart",
    pistonId: "dart",
    pistonVersion: "2.19.6",
    emoji: "🎯",
    extension: ".dart",
  },
  {
    id: "haskell",
    name: "Haskell",
    monacoId: "haskell",
    pistonId: "haskell",
    pistonVersion: "9.0.1",
    emoji: "λ",
    extension: ".hs",
  },
];

export const getLanguageById = (id: LanguageId): Language =>
  LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
