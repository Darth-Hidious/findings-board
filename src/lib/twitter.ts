import { TwitterApi } from "twitter-api-v2";
import { getConfig, hasXCredentials } from "./config";
import type { ThreadTweet } from "./types";

export type PostThreadResult = {
  dryRun: boolean;
  threadUrl: string | null;
  tweetIds: string[];
  payload: ThreadTweet[];
  message: string;
};

function dryRunUrl(config = getConfig()): string {
  return `${config.siteUrl.replace(/\/$/, "")}/board?dryRun=1`;
}

export async function postThread(
  tweets: ThreadTweet[],
): Promise<PostThreadResult> {
  const config = getConfig();
  const cleaned = tweets
    .map((t) => ({ ...t, text: t.text.trim().slice(0, 280) }))
    .filter((t) => t.text.length > 0);

  if (cleaned.length === 0) {
    return {
      dryRun: true,
      threadUrl: null,
      tweetIds: [],
      payload: cleaned,
      message: "Empty thread — nothing to post.",
    };
  }

  if (!hasXCredentials(config)) {
    console.info("[dry-run] X thread payload", JSON.stringify(cleaned, null, 2));
    return {
      dryRun: true,
      threadUrl: dryRunUrl(config),
      tweetIds: cleaned.map((_, i) => `dry-${i + 1}`),
      payload: cleaned,
      message:
        "Dry-run: X API keys missing. Thread logged server-side and marked posted locally.",
    };
  }

  const client = new TwitterApi({
    appKey: config.xApiKey!,
    appSecret: config.xApiSecret!,
    accessToken: config.xAccessToken!,
    accessSecret: config.xAccessSecret!,
  });

  const rw = client.readWrite;
  const tweetIds: string[] = [];
  let replyTo: string | undefined;

  for (const [index, tweet] of cleaned.entries()) {
    const mediaIds: string[] = [];
    if (index === 0 && tweet.mediaUrls?.length) {
      for (const url of tweet.mediaUrls.slice(0, 4)) {
        try {
          const mediaRes = await fetch(url);
          if (!mediaRes.ok) continue;
          const buf = Buffer.from(await mediaRes.arrayBuffer());
          const contentType = mediaRes.headers.get("content-type") || "";
          const mimeType = contentType.includes("video")
            ? "video/mp4"
            : contentType.includes("png")
              ? "image/png"
              : contentType.includes("webp")
                ? "image/webp"
                : contentType.includes("gif")
                  ? "image/gif"
                  : "image/jpeg";
          const mediaId = await rw.v1.uploadMedia(buf, { mimeType });
          mediaIds.push(mediaId);
        } catch (error) {
          console.error("Media upload failed", url, error);
        }
      }
    }

    const payload: {
      text: string;
      reply?: { in_reply_to_tweet_id: string };
      media?: {
        media_ids: [string] | [string, string] | [string, string, string] | [string, string, string, string];
      };
    } = {
      text: tweet.text,
    };
    if (replyTo) {
      payload.reply = { in_reply_to_tweet_id: replyTo };
    }
    if (mediaIds.length === 1) {
      payload.media = { media_ids: [mediaIds[0]!] };
    } else if (mediaIds.length === 2) {
      payload.media = { media_ids: [mediaIds[0]!, mediaIds[1]!] };
    } else if (mediaIds.length === 3) {
      payload.media = {
        media_ids: [mediaIds[0]!, mediaIds[1]!, mediaIds[2]!],
      };
    } else if (mediaIds.length >= 4) {
      payload.media = {
        media_ids: [mediaIds[0]!, mediaIds[1]!, mediaIds[2]!, mediaIds[3]!],
      };
    }

    const created = await rw.v2.tweet(payload);

    const id = created.data.id;
    tweetIds.push(id);
    replyTo = id;
  }

  const handle = config.xHandle || "i";
  const threadUrl = `https://x.com/${handle}/status/${tweetIds[0]}`;

  return {
    dryRun: false,
    threadUrl,
    tweetIds,
    payload: cleaned,
    message: "Posted thread to X.",
  };
}
