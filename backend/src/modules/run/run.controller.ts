import type { Request, Response } from "express";

const JUDGE0_CE_URL = "https://ce.judge0.com";
const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  java: 91,
  c: 50,
  "c++": 54,
  go: 106,
  rust: 73,
  ruby: 72,
  php: 98,
  csharp: 51,
  kotlin: 78,
  swift: 83,
  rscript: 80,
  typescript: 94,
  sqlite3: 82,
};

const PISTON_ENDPOINTS = [
  "https://emkc.org/api/v2/execute",
  "https://emkc.org/api/v2/piston/execute",
];

function buildJudge0Headers(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = process.env.JUDGE0_AUTH_TOKEN?.trim();
  if (token) headers["X-Auth-Token"] = token;
  return headers;
}

/** Judge0 compiles Java as Main.java – normalize so the first public class is Main. */
function normalizeJavaClassForJudge0(sourceCode: string): string {
  return sourceCode.replace(/public\s+class\s+\w+/, "public class Main");
}

/**
 * If Java code is a snippet (no class declaration), wrap it in Main and main()
 * so it compiles. Keeps package/import at top; wraps the rest in class Main { main() { } }.
 * Otherwise normalize the public class name to Main.
 */
function prepareJavaCode(code: string): string {
  const trimmed = code.trim();
  const hasClass = /\bclass\s+\w+/.test(trimmed);
  if (hasClass) {
    return normalizeJavaClassForJudge0(code);
  }
  const lines = trimmed.split("\n");
  const topLevel: string[] = [];
  const body: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("package ") || t.startsWith("import ")) {
      topLevel.push(line);
    } else {
      body.push(line);
    }
  }
  const bodyTrimmed = body.join("\n").trim();
  const indented = bodyTrimmed.split("\n").map((line) => "        " + line).join("\n");
  const top = topLevel.length ? topLevel.join("\n") + "\n\n" : "";
  return `${top}public class Main {\n    public static void main(String[] args) {\n${indented}\n    }\n}`;
}

export async function executeCode(req: Request, res: Response) {
  const body = (req.body as { language?: string; version?: string; code?: string; stdin?: string }) ?? {};
  const language = body.language?.trim();
  const code = body.code != null ? String(body.code) : "";
  const stdin = body.stdin != null ? String(body.stdin) : "";

  if (!language) {
    res.status(400).json({ error: "language is required" });
    return;
  }

  const judge0LangId = JUDGE0_LANGUAGE_IDS[language.toLowerCase()];
  if (judge0LangId != null) {
    try {
      const sourceCode = language.toLowerCase() === "java" ? prepareJavaCode(code) : code;
      const url = `${JUDGE0_CE_URL}/submissions?base64_encoded=false&wait=true`;
      const response = await fetch(url, {
        method: "POST",
        headers: buildJudge0Headers(),
        body: JSON.stringify({
          source_code: sourceCode,
          language_id: judge0LangId,
          stdin: stdin || undefined,
        }),
      });
      const text = await response.text();
      if (response.ok) {
        const data = JSON.parse(text) as {
          stdout: string | null;
          stderr: string | null;
          compile_output: string | null;
          message: string | null;
          status?: { id: number };
          exit_code: number | null;
        };
        const statusId = data.status?.id ?? 0;
        const accepted = statusId === 3;
        const stderr = [data.compile_output, data.stderr].filter(Boolean).join("\n").trim() || "";
        res.json({
          stdout: data.stdout ?? "",
          stderr,
          exitCode: accepted ? (data.exit_code ?? 0) : 1,
          compileStdout: data.compile_output ?? "",
          compileStderr: "",
        });
        return;
      }
      if (response.status === 401 || response.status === 403) {
        res.status(502).json({
          error: "Execution service error",
          details:
            "Judge0 requires an API key. Get a free key at RapidAPI (Judge0 CE), then set JUDGE0_AUTH_TOKEN in the server .env. Or use JavaScript/Python in the compiler (they run in your browser).",
        });
        return;
      }
      res.status(502).json({
        error: "Execution service error",
        details: text.slice(0, 300) || `HTTP ${response.status}`,
      });
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to run code";
      res.status(502).json({ error: msg });
      return;
    }
  }

  const version = body.version?.trim() || "*";
  const payload = {
    language,
    version,
    files: [{ content: code }],
  };

  let lastStatus = 0;
  let text = "";

  try {
    for (const url of PISTON_ENDPOINTS) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      text = await response.text();
      lastStatus = response.status;
      if (response.ok) break;
      if (response.status !== 404) {
        let details = text.slice(0, 400);
        try {
          const json = JSON.parse(text) as { message?: string };
          if (json.message && (json.message.includes("whitelist") || json.message.includes("Piston"))) {
            details =
              "The public code execution service is no longer available. Use JavaScript or Python in the Online Compiler (they run in your browser). For Java, C++, etc., set JUDGE0_AUTH_TOKEN (see Judge0 CE on RapidAPI) or self-host Piston.";
          }
        } catch {
          // keep raw details
        }
        res.status(502).json({
          error: "Execution service error",
          details,
        });
        return;
      }
    }

    if (lastStatus < 200 || lastStatus >= 300) {
      let details = text.slice(0, 400);
      try {
        const json = JSON.parse(text) as { message?: string };
        if (json.message && (json.message.includes("whitelist") || json.message.includes("Piston"))) {
          details =
            "The public code execution service is no longer available. Use JavaScript or Python in the compiler (they run in your browser). For Java, C++, etc., set JUDGE0_AUTH_TOKEN or self-host Piston.";
        }
      } catch {
        // keep raw
      }
      res.status(502).json({
        error: "Execution service error",
        details: details || `HTTP ${lastStatus}`,
      });
      return;
    }

    let data: {
      run?: { stdout?: string; stderr?: string; code?: number };
      compile?: { stdout?: string; stderr?: string; code?: number };
    };
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      res.status(502).json({ error: "Invalid response from execution service", details: text.slice(0, 200) });
      return;
    }

    res.json({
      stdout: data.run?.stdout ?? "",
      stderr: data.run?.stderr ?? "",
      exitCode: data.run?.code ?? -1,
      compileStdout: data.compile?.stdout ?? "",
      compileStderr: data.compile?.stderr ?? "",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to run code";
    res.status(502).json({ error: msg });
  }
}
