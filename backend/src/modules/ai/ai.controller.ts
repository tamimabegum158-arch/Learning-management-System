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
  let geminiKey = (process.env.GEMINI_API_KEY ?? env.GEMINI_API_KEY)?.trim();
  // If still missing, load .env from backend folder (works even when cwd is project root)
  if (!geminiKey && existsSync(backendEnvPath)) {
    dotenv.config({ path: backendEnvPath });
    geminiKey = process.env.GEMINI_API_KEY?.trim();
  }

  if (!geminiKey) {
    res.status(503).json({
      error: "AI help is not configured",
      details:
        "Get a free API key at https://aistudio.google.com/app/apikey (no credit card), then set GEMINI_API_KEY in backend .env and restart the server.",
    });
    return;
  }

  try {
    const fullPrompt = `${systemPrompt}\n\nStudent question: ${question}`;
    const res = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(geminiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    });
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (!res.ok) {
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
