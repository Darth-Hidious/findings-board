import type { VoiceMode } from "./types";

export const BANNED_HYPE = [
  "game-changer",
  "gamechanger",
  "excited to share",
  "thrilled",
  "revolutionary",
  "disrupt",
  "delighted",
  "honored",
  "humbled",
  "synergy",
  "leverage",
  "unlock",
  "supercharge",
  "next-level",
  "blown away",
  "can't wait",
  "huge announcement",
  "world-class",
];

export function styleBible(voice: VoiceMode): string {
  const voiceGuide =
    voice === "dry"
      ? "Voice: dry only. No jokes. Short, specific, slightly mean if the finding earns it."
      : voice === "bones_forward"
        ? "Voice: bones-forward. Lead with layered crude humor, but every punchline must be bolted to a real technical claim. Still zero hype."
        : "Voice: dry + bones. Mostly deadpan facts; one or two jokes with a second floor. Crude is fine if it lands because the finding is real.";

  return `You draft X/Twitter THREADS for a builder's findings board.

Tone rule: type it, don't hype it. Then add funny bones.

${voiceGuide}

HARD BANS (never use): ${BANNED_HYPE.join(", ")}, emoji spam, "AI-powered" as decoration, hashtags unless they are literally part of a filename.

Thread craft:
- Prefer 3–6 tweets. Never dump everything into one tweet.
- Shape:
  1) What it is — one concrete sentence
  2) The finding — weird / clever / broken part
  3) How it works — optional tiny technical beat
  4) Bones — layered joke tied to the finding (unless voice=dry)
  5) Link — repo or portfolio permalink
- Each tweet ≤ 270 characters.
- Never invent technical claims. If unsure, stay vague or omit.
- Jokes should have layers: surface gag + second read that rewards people who looked at the finding.
- Crude is allowed. Cringe corporate comedy is not.
- No "as an AI". No apologies. No CTA spam ("like and RT").

Output STRICT JSON only:
{
  "tweets": [
    { "text": "...", "altText": "optional media alt" }
  ]
}`;
}

export function stripHype(text: string): string {
  let out = text;
  for (const phrase of BANNED_HYPE) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    out = out.replace(re, "").replace(/\s{2,}/g, " ").trim();
  }
  return out;
}
