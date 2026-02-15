// ── Piston API Code Execution Service ─────────────────────────────────
// Free, no API key needed. Supports 50+ languages.
// Docs: https://github.com/engineer-man/piston

const PISTON_API = "https://emkc.org/api/v2/piston";

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
  signal: string | null;
  language: string;
  version: string;
}

export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

/**
 * Execute code using the Piston API.
 * No API key needed — completely free.
 */
export async function executeCode(
  language: string,
  version: string,
  sourceCode: string,
  stdin: string = ""
): Promise<ExecutionResult> {
  const response = await fetch(`${PISTON_API}/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language,
      version,
      files: [{ content: sourceCode }],
      stdin,
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Piston API error (${response.status}): ${text}`);
  }

  const data = await response.json();

  // Piston returns { run: { stdout, stderr, code, signal, output }, compile?: {...} }
  const run = data.run;
  const compile = data.compile;

  // If compilation failed, show compile errors
  if (compile && compile.code !== 0 && compile.stderr) {
    return {
      stdout: "",
      stderr: compile.stderr,
      output: compile.stderr,
      code: compile.code,
      signal: compile.signal,
      language: data.language,
      version: data.version,
    };
  }

  return {
    stdout: run.stdout || "",
    stderr: run.stderr || "",
    output: run.output || run.stdout || run.stderr || "",
    code: run.code,
    signal: run.signal,
    language: data.language,
    version: data.version,
  };
}

/**
 * Get list of available runtimes from Piston.
 */
export async function getRuntimes(): Promise<PistonRuntime[]> {
  const response = await fetch(`${PISTON_API}/runtimes`);
  if (!response.ok) throw new Error("Failed to fetch runtimes");
  return response.json();
}
