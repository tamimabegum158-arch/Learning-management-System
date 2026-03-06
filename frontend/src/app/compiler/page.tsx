"use client";

import { useState, useRef } from "react";
import { config } from "@/lib/config";
import { AuthGuard } from "@/components/Auth/AuthGuard";
import { Button } from "@/components/common/Button";

function toStr(x: unknown): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "object") return JSON.stringify(x);
  return String(x);
}

const PYODIDE_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full";
const TYPESCRIPT_CDN = "https://cdn.jsdelivr.net/npm/typescript@5.0.4/lib/typescript.min.js";

const LANGUAGES = [
  { id: "javascript", name: "JavaScript (runs in browser)", version: "18.15.0", defaultCode: "console.log('Hello, World!');" },
  { id: "python", name: "Python (runs in browser)", version: "3.10.0", defaultCode: "print('Hello, World!')" },
  { id: "typescript", name: "TypeScript (runs in browser)", version: "5.0.3", defaultCode: "console.log('Hello, World!');" },
  { id: "java", name: "Java", version: "15.0.2", defaultCode: "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"Hello, World!\");\n  }\n}" },
  { id: "c", name: "C", version: "10.2.0", defaultCode: "#include <stdio.h>\nint main() {\n  printf(\"Hello, World!\\n\");\n  return 0;\n}" },
  { id: "c++", name: "C++", version: "10.2.0", defaultCode: "#include <iostream>\nint main() {\n  std::cout << \"Hello, World!\" << std::endl;\n  return 0;\n}" },
  { id: "go", name: "Go", version: "1.16.2", defaultCode: "package main\nimport \"fmt\"\nfunc main() {\n  fmt.Println(\"Hello, World!\")\n}" },
  { id: "rust", name: "Rust", version: "1.68.2", defaultCode: "fn main() {\n  println!(\"Hello, World!\");\n}" },
  { id: "ruby", name: "Ruby", version: "3.0.1", defaultCode: "puts 'Hello, World!'" },
  { id: "php", name: "PHP", version: "8.2.3", defaultCode: "<?php\necho 'Hello, World!';\n?>" },
  { id: "csharp", name: "C#", version: "6.12.0", defaultCode: "using System;\nclass Program {\n  static void Main() {\n    Console.WriteLine(\"Hello, World!\");\n  }\n}" },
  { id: "kotlin", name: "Kotlin", version: "1.8.20", defaultCode: "fun main() {\n  println(\"Hello, World!\")\n}" },
  { id: "swift", name: "Swift", version: "5.3.3", defaultCode: "print(\"Hello, World!\")" },
  { id: "rscript", name: "R", version: "4.1.1", defaultCode: "cat('Hello, World!\\n')" },
  { id: "sqlite3", name: "SQLite", version: "3.36.0", defaultCode: "SELECT 'Hello, World!';" },
];

export default function CompilerPage() {
  const defaultLang = LANGUAGES[0];
  const [language, setLanguage] = useState(defaultLang);
  const [code, setCode] = useState(defaultLang.defaultCode);
  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exitCode: number; error?: string; details?: string } | null>(null);
  const pyodideRef = useRef<{
    setStdout: (o: { batched?: (s: string) => void }) => void;
    setStderr: (o: { batched?: (s: string) => void }) => void;
    setStdin: (o: { stdin: () => string | undefined }) => void;
    runPythonAsync: (code: string) => Promise<unknown>;
  } | null>(null);
  const pyodideLoadPromiseRef = useRef<Promise<unknown> | null>(null);
  const tsLoadPromiseRef = useRef<Promise<void> | null>(null);

  const loadTypeScriptOnce = (): Promise<void> => {
    if (tsLoadPromiseRef.current) return tsLoadPromiseRef.current;
    tsLoadPromiseRef.current = (async () => {
      if ((window as unknown as { ts?: unknown }).ts) return;
      const script = document.createElement("script");
      script.src = TYPESCRIPT_CDN;
      script.async = true;
      document.head.appendChild(script);
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load TypeScript"));
      });
      if (!(window as unknown as { ts?: unknown }).ts) throw new Error("TypeScript not available");
    })();
    return tsLoadPromiseRef.current;
  };

  const loadPyodideOnce = (): Promise<void> => {
    if (pyodideRef.current) return Promise.resolve();
    if (pyodideLoadPromiseRef.current) return pyodideLoadPromiseRef.current as Promise<void>;
    const p = (async () => {
      const script = document.createElement("script");
      script.src = `${PYODIDE_INDEX}/pyodide.js`;
      script.async = true;
      document.head.appendChild(script);
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Python runtime"));
      });
      const loadPyodide = (window as unknown as { loadPyodide: (opts: { indexURL: string }) => Promise<typeof pyodideRef.current> }).loadPyodide;
      if (!loadPyodide) throw new Error("Python runtime not available");
      pyodideRef.current = await loadPyodide({ indexURL: PYODIDE_INDEX });
    })();
    pyodideLoadPromiseRef.current = p;
    return p as Promise<void>;
  };

  const runPythonInBrowser = async (
    pythonCode: string,
    stdinText: string
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const lines = stdinText.split(/\r?\n/);
    let lineIndex = 0;
    const pyodide = pyodideRef.current!;
    pyodide.setStdout({ batched: (s: string) => stdout.push(s) });
    pyodide.setStderr({ batched: (s: string) => stderr.push(s) });
    pyodide.setStdin({
      stdin: () => (lineIndex < lines.length ? lines[lineIndex++] : undefined),
    });
    try {
      await pyodide.runPythonAsync(pythonCode);
      return { stdout: stdout.join("\n"), stderr: stderr.join("\n"), exitCode: 0 };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      stderr.push(msg);
      return { stdout: stdout.join("\n"), stderr: stderr.join("\n"), exitCode: 1 };
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const lang = LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];
    setLanguage(lang);
    setCode(lang.defaultCode);
    setOutput(null);
  };

  const runJavaScriptCode = (jsCode: string): { stdout: string; stderr: string; exitCode: number } => {
    const out: string[] = [];
    const err: string[] = [];
    const origLog = console.log;
    const origError = console.error;
    const origWarn = console.warn;
    console.log = (...args: unknown[]) => out.push(args.map((a) => String(a)).join(" "));
    console.error = (...args: unknown[]) => err.push(args.map((a) => String(a)).join(" "));
    console.warn = (...args: unknown[]) => err.push(args.map((a) => String(a)).join(" "));
    try {
      const fn = new Function(jsCode);
      fn();
      return { stdout: out.join("\n"), stderr: err.join("\n"), exitCode: 0 };
    } catch (e) {
      const msg = e instanceof Error ? (e.stack ?? e.message) : String(e);
      err.push(msg);
      return { stdout: out.join("\n"), stderr: err.join("\n"), exitCode: 1 };
    } finally {
      console.log = origLog;
      console.error = origError;
      console.warn = origWarn;
    }
  };

  const runJavaScriptInBrowser = (): { stdout: string; stderr: string; exitCode: number } =>
    runJavaScriptCode(code);

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);

    if (language.id === "javascript") {
      try {
        const result = runJavaScriptInBrowser();
        setOutput({
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        });
      } catch (e) {
        setOutput({
          stdout: "",
          stderr: "",
          exitCode: -1,
          error: e instanceof Error ? e.message : "Failed to run code",
        });
      }
      setRunning(false);
      return;
    }

    if (language.id === "typescript") {
      try {
        await loadTypeScriptOnce();
        const ts = (window as unknown as { ts: { transpileModule: (src: string, opts: { compilerOptions: { module?: number; target?: number } }) => { outputText: string } } }).ts;
        const { outputText: jsCode } = ts.transpileModule(code, {
          compilerOptions: { module: 0, target: 99 },
        });
        const result = runJavaScriptCode(jsCode);
        setOutput({
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        });
      } catch (e) {
        setOutput({
          stdout: "",
          stderr: "",
          exitCode: -1,
          error: e instanceof Error ? e.message : "Failed to run TypeScript",
        });
      }
      setRunning(false);
      return;
    }

    if (language.id === "python") {
      try {
        await loadPyodideOnce();
        const result = await runPythonInBrowser(code, stdin);
        setOutput({
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
        });
      } catch (e) {
        setOutput({
          stdout: "",
          stderr: "",
          exitCode: -1,
          error: e instanceof Error ? e.message : "Failed to run Python",
        });
      }
      setRunning(false);
      return;
    }

    try {
      const res = await fetch(config.apiUrl("/api/run"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          language: language.id,
          version: language.version,
          code,
          stdin,
        }),
      });
      const data = await res.json().catch(() => ({})) as { stdout?: string; stderr?: string; exitCode?: number; error?: unknown; details?: unknown };
      if (!res.ok) {
        const details = toStr(data.details);
        const isServiceUnavailable =
          details.includes("whitelist") ||
          details.includes("Piston") ||
          details.includes("hosting your own");
        setOutput({
          stdout: "",
          stderr: "",
          exitCode: -1,
          error: toStr(data.error) || `Request failed: ${res.status}`,
          details: isServiceUnavailable
            ? "The public code execution service is no longer available. Use JavaScript, Python, or TypeScript (they run in your browser). For Java, C++, etc., set JUDGE0_AUTH_TOKEN or self-host Piston."
            : details,
        });
        return;
      }
      setOutput({
        stdout: toStr(data.stdout),
        stderr: toStr(data.stderr),
        exitCode: typeof data.exitCode === "number" ? data.exitCode : -1,
        error: data.error != null ? toStr(data.error) : undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : (typeof e === "object" && e !== null ? JSON.stringify(e) : String(e));
      const isNetworkError = msg === "Failed to fetch" || msg.includes("NetworkError when attempting to fetch resource");
      setOutput({
        stdout: "",
        stderr: "",
        exitCode: -1,
        error: isNetworkError ? "Could not reach the server." : msg,
        details: isNetworkError
          ? `Make sure the backend is running (in the backend folder run: npm run dev). The frontend is calling ${config.apiUrl("/api/run")}. If the backend uses a different URL, set NEXT_PUBLIC_API_BASE_URL in frontend .env.local.`
          : undefined,
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <AuthGuard>
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Compiler
      </h1>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label htmlFor="compiler-lang" className="text-sm font-medium text-foreground">
          Language
        </label>
        <select
          id="compiler-lang"
          value={language.id}
          onChange={handleLanguageChange}
          className="px-3 py-2 border border-border rounded-lg bg-card text-foreground"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <Button onClick={handleRun} disabled={running}>
          {running ? "Running…" : "Run"}
        </Button>
      </div>

      <div className="mb-4">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-72 px-4 py-3 font-mono text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted resize-y min-h-[200px]"
          placeholder="Enter your code..."
        />
      </div>
      {(language.id === "python" || !["javascript", "python", "typescript"].includes(language.id)) && (
        <div className="mb-4">
          <label htmlFor="stdin" className="block text-sm font-medium text-foreground mb-1">
            Standard input (optional)
          </label>
          <textarea
            id="stdin"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder={language.id === "python"
              ? "One value per line, e.g. for input(): 10 then 20"
              : "One value per line, e.g. for Scanner/scanf: 10 then 20"}
            rows={3}
            className="w-full px-4 py-2 font-mono text-sm border border-border rounded-lg bg-card text-foreground placeholder:text-muted"
          />
        </div>
      )}

      {output && (
        <div className="p-4 border border-border rounded-lg bg-card">
          <h2 className="text-sm font-medium text-foreground mb-2">Output</h2>
          {output.error && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-2">{toStr(output.error)}</p>
          )}
          {output.details && (
            <p className="text-muted text-xs font-mono whitespace-pre-wrap mb-2">{toStr(output.details)}</p>
          )}
          {output.stderr && (
            <pre className="text-foreground text-sm whitespace-pre-wrap font-mono mb-2">
              {output.stderr}
            </pre>
          )}
          {output.stdout && (
            <pre className="text-foreground text-sm whitespace-pre-wrap font-mono">
              {output.stdout}
            </pre>
          )}
          {!output.stdout && !output.stderr && !output.error && (
            <p className="text-muted text-sm">(No output)</p>
          )}
          <p className="text-xs text-muted mt-2">Exit code: {output.exitCode}</p>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
