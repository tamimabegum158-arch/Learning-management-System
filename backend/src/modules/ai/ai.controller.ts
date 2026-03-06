import type { Request, Response } from "express";
import dotenv from "dotenv";
import { env, backendEnvPath } from "../../config/env.js";
import { existsSync } from "fs";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function getSystemPrompt(contextParts: string[]): string {
  return (
    `You are a friendly and clear tutor for an online learning platform (LMS). ` +
    `The student has just watched or is watching a lesson and needs help understanding something. ` +
    (contextParts.length > 0 ? `Current context:\n${contextParts.join("\n")}\n\n` : "") +
    `Answer their question in a helpful, concise way. Use simple language and examples if useful. ` +
    `If the question is not about the lesson, still help them learn. Keep answers focused and not too long.`
  );
}

export async function ask(req: Request, res: Response) {
  const body = (req.body as {
    question?: string;
    subject_title?: string;
    video_title?: string;
    video_description?: string;
  }) ?? {};
  const question = body.question?.trim();
  if (!question) {
    res.status(400).json({ error: "question is required" });
    return;
  }

  const subjectTitle = body.subject_title?.trim() ?? "";
  const videoTitle = body.video_title?.trim() ?? "";
  const videoDescription = body.video_description?.trim() ?? "";

  const contextParts: string[] = [];
  if (subjectTitle) contextParts.push(`Subject: ${subjectTitle}`);
  if (videoTitle) contextParts.push(`Lesson/Video: ${videoTitle}`);
  if (videoDescription) contextParts.push(`Lesson description: ${videoDescription}`);

  const systemPrompt = getSystemPrompt(contextParts);
  let geminiKey: string | undefined = (process.env.GEMINI_API_KEY ?? env.GEMINI_API_KEY)?.trim();
  // If still missing, load .env from backend folder (works even when cwd is project root)
  if (!geminiKey && existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
    geminiKey = process.env.GEMINI_API_KEY?.trim() ?? undefined;
  }

  if (!geminiKey) {
    res.status(503).json({
      error: "AI help is not configured",
      details:
        "Get a free API key at https://aistudio.google.com/app/apikey (no credit card), then set GEMINI_API_KEY in backend .env and restart the server.",
    });
    return;
  }

  const apiKey: string = geminiKey;

  try {
    const fullPrompt = `${systemPrompt}\n\nStudent question: ${question}`;
    const fetchRes = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });
    const data = (await fetchRes.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (!fetchRes.ok) {
      const errMsg = data.error?.message ?? (typeof data === "object" ? JSON.stringify(data).slice(0, 300) : "Unknown error");
      res.status(502).json({ error: "AI service error", details: errMsg });
      return;
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      res.status(502).json({ error: "AI service error", details: "Gemini returned no text." });
      return;
    }
    res.json({ answer: text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to get AI response";
    res.status(502).json({ error: "AI service error", details: msg });
  }
}

// Hugging Face Inference Providers – Responses API (fine-grained token with "Make calls to Inference Providers")
// Docs: https://huggingface.co/docs/inference-providers/en/guides/responses-api
const HF_RESPONSES_URL = "https://router.huggingface.co/v1/responses";
const DEFAULT_HF_CHAT_MODEL = "moonshotai/Kimi-K2-Instruct-0905:groq";

/** GET /api/ai/chat/status – whether HUGGINGFACE_TOKEN is set (no token value returned). */
export function chatStatus(req: Request, res: Response) {
  let token: string | undefined = (process.env.HUGGINGFACE_TOKEN ?? env.HUGGINGFACE_TOKEN)?.trim();
  if (!token && existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
    token = process.env.HUGGINGFACE_TOKEN?.trim() ?? undefined;
  }
  if (!token) {
    return res.json({ configured: false, reason: "missing_token" });
  }
  res.json({ configured: true, reason: "token_set" });
}

/** Build Responses API input: array of { role, content } from chat history. */
function toResponsesInput(messages: Array<{ role: string; content: string }>): Array<{ role: "user" | "assistant" | "developer"; content: string }> {
  const out: Array<{ role: "user" | "assistant" | "developer"; content: string }> = [];
  for (const m of messages) {
    const text = (m.content ?? "").trim();
    if (!text) continue;
    const role = m.role === "model" || m.role === "assistant" ? "assistant" : "user";
    out.push({ role, content: text });
  }
  return out;
}

export async function chat(req: Request, res: Response) {
  const body = (req.body as { messages?: Array<{ role: string; content: string }> }) ?? {};
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const lastMsg = messages[messages.length - 1];
  const userContent = lastMsg?.role === "user" ? lastMsg.content?.trim() : "";

  if (!userContent) {
    res.status(400).json({ error: "messages must end with a user message" });
    return;
  }

  let hfToken: string | undefined = (process.env.HUGGINGFACE_TOKEN ?? env.HUGGINGFACE_TOKEN)?.trim();
  if (!hfToken && existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
    hfToken = process.env.HUGGINGFACE_TOKEN?.trim() ?? undefined;
  }

  if (!hfToken) {
    res.status(503).json({
      error: "AI chat is not configured",
      details:
        "Get a free token at https://huggingface.co/settings/tokens (fine-grained, 'Make calls to Inference Providers'), then set HUGGINGFACE_TOKEN in backend .env and restart.",
    });
    return;
  }

  const token: string = hfToken;
  const model = (process.env.HF_CHAT_MODEL ?? env.HF_CHAT_MODEL ?? DEFAULT_HF_CHAT_MODEL).trim() || DEFAULT_HF_CHAT_MODEL;

  try {
    const inputMessages = toResponsesInput(messages);
    const body: { model: string; instructions: string; input: string | Array<{ role: string; content: string }> } = {
      model,
      instructions: "You are a helpful assistant. Be concise.",
      input: inputMessages.length === 1 && inputMessages[0].role === "user" ? inputMessages[0].content : inputMessages,
    };
    const fetchRes = await fetch(HF_RESPONSES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const data = (await fetchRes.json()) as
      | { output_text?: string; output?: Array<{ type?: string; content?: string }>; error?: string; message?: string }
      | { error?: string; message?: string };

    if (!fetchRes.ok) {
      const err =
        typeof data === "object" && data !== null && "error" in data
          ? (data as { error?: unknown }).error
          : (data as { message?: unknown }).message;
      const errStr =
        err == null
          ? ""
          : typeof err === "string"
            ? err
            : typeof err === "object"
              ? JSON.stringify(err)
              : String(err);
      if (errStr.toLowerCase().includes("loading")) {
        res.status(503).json({
          error: "Model is loading",
          details: "Hugging Face is starting the model. Wait a minute and try again.",
        });
        return;
      }
      if (fetchRes.status === 401 || /invalid|password|unauthorized|authentication|token/i.test(errStr)) {
        res.status(401).json({
          error: "Hugging Face token invalid or expired",
          details:
            "Use a fine-grained token with 'Make calls to Inference Providers' at https://huggingface.co/settings/tokens. Set HUGGINGFACE_TOKEN in backend .env and restart.",
        });
        return;
      }
      res.status(502).json({
        error: "AI service error",
        details: errStr || (typeof data === "object" ? JSON.stringify(data).slice(0, 300) : "Unknown error"),
      });
      return;
    }

    const raw = data as Record<string, unknown>;
    const outputText = typeof raw.output_text === "string" ? raw.output_text.trim() : "";
    const outputArray = Array.isArray(raw.output) ? raw.output : [];
    const parts: string[] = [];
    for (const item of outputArray) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      if (typeof o.text === "string") {
        parts.push(o.text);
        continue;
      }
      if (typeof o.content === "string") {
        parts.push(o.content);
        continue;
      }
      const content = o.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (c && typeof c === "object") {
            const cc = c as Record<string, unknown>;
            if (typeof cc.text === "string") parts.push(cc.text);
            else if (typeof cc.content === "string") parts.push(cc.content);
          }
        }
      }
    }
    const fromOutput = parts.join("").trim();
    const replyText = outputText || fromOutput;
    if (!replyText) {
      res.status(502).json({
        error: "AI service error",
        details: "No reply from model. Try another message or set HF_CHAT_MODEL in .env (e.g. moonshotai/Kimi-K2-Instruct-0905:groq).",
      });
      return;
    }
    res.json({ reply: replyText });
  } catch (e) {
    const msg =
      e instanceof Error
        ? e.message
        : typeof e === "object" && e !== null
          ? JSON.stringify(e)
          : String(e);
    res.status(502).json({ error: "AI service error", details: msg });
  }
}
