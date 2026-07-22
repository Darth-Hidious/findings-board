import { getConfig } from "./config";
import { styleBible, stripHype } from "./style-bible";
import type { Finding, ThreadTweet, VoiceMode } from "./types";

type GrokResponse = {
  choices?: Array<{
    message?: { content?: string };
  }>;
};

function fallbackThread(finding: Finding, voice: VoiceMode): ThreadTweet[] {
  const tweets: ThreadTweet[] = [
    {
      text: stripHype(
        `${finding.title}. ${finding.summary}`.slice(0, 270),
      ),
      mediaUrls: finding.mediaUrls.slice(0, 1),
    },
    {
      text: stripHype(
        (finding.readmeExcerpt || finding.whyPicked || "Details in the repo.")
          .slice(0, 270),
      ),
    },
  ];

  if (voice !== "dry") {
    tweets.push({
      text:
        voice === "bones_forward"
          ? "If this breaks in prod I'll pretend it was performance art. It wasn't. It was me."
          : "The bug had layers. So does the joke. Only one of them was intentional.",
    });
  }

  tweets.push({
    text: finding.repoUrl.slice(0, 270),
  });

  return tweets;
}

function extractJson(content: string): { tweets: ThreadTweet[] } | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced?.[1]?.trim() || content.trim();
  try {
    const parsed = JSON.parse(raw) as { tweets?: ThreadTweet[] };
    if (Array.isArray(parsed.tweets) && parsed.tweets.length > 0) {
      return {
        tweets: parsed.tweets.map((t) => ({
          text: stripHype(String(t.text || "")).slice(0, 280),
          altText: t.altText,
          mediaUrls: t.mediaUrls,
        })),
      };
    }
  } catch {
    // try to find first object
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        const parsed = JSON.parse(raw.slice(start, end + 1)) as {
          tweets?: ThreadTweet[];
        };
        if (Array.isArray(parsed.tweets) && parsed.tweets.length > 0) {
          return {
            tweets: parsed.tweets.map((t) => ({
              text: stripHype(String(t.text || "")).slice(0, 280),
              altText: t.altText,
              mediaUrls: t.mediaUrls,
            })),
          };
        }
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function draftThread(
  finding: Finding,
  voice: VoiceMode = finding.voice || "dry_bones",
): Promise<{ tweets: ThreadTweet[]; usedFallback: boolean; model?: string }> {
  const config = getConfig();
  if (!config.xaiApiKey) {
    return { tweets: fallbackThread(finding, voice), usedFallback: true };
  }

  const userPrompt = `Draft a thread for this finding.

Title: ${finding.title}
Summary: ${finding.summary}
Repo: ${finding.repoFullName} (${finding.repoUrl})
Why picked: ${finding.whyPicked}
README excerpt: ${finding.readmeExcerpt || "(none)"}
Media URLs: ${finding.mediaUrls.join(", ") || "(none)"}
Portfolio: ${config.siteUrl}
X handle: @${config.xHandle || "unknown"}

Attach media intent only on tweet 1 if media exists. Keep claims grounded.`;

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.xaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.xaiModel,
        temperature: voice === "dry" ? 0.4 : 0.85,
        messages: [
          { role: "system", content: styleBible(voice) },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Grok draft failed", res.status, errText.slice(0, 300));
      return { tweets: fallbackThread(finding, voice), usedFallback: true };
    }

    const data = (await res.json()) as GrokResponse;
    const content = data.choices?.[0]?.message?.content || "";
    const parsed = extractJson(content);
    if (!parsed) {
      return { tweets: fallbackThread(finding, voice), usedFallback: true };
    }

    // Attach finding media to first tweet if model omitted it
    if (finding.mediaUrls.length > 0 && parsed.tweets[0]) {
      parsed.tweets[0].mediaUrls =
        parsed.tweets[0].mediaUrls?.length
          ? parsed.tweets[0].mediaUrls
          : finding.mediaUrls.slice(0, 1);
    }

    return {
      tweets: parsed.tweets.filter((t) => t.text.trim().length > 0).slice(0, 6),
      usedFallback: false,
      model: config.xaiModel,
    };
  } catch (error) {
    console.error("Grok draft error", error);
    return { tweets: fallbackThread(finding, voice), usedFallback: true };
  }
}
