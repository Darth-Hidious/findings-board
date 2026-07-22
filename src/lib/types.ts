export type FindingStatus =
  | "new"
  | "drafted"
  | "approved"
  | "posted"
  | "skipped";

export type VoiceMode = "dry" | "dry_bones" | "bones_forward";

export type ThreadTweet = {
  text: string;
  mediaUrls?: string[];
  altText?: string;
};

export type Finding = {
  id: string;
  sourceKey: string;
  title: string;
  summary: string;
  repoFullName: string;
  repoUrl: string;
  readmeExcerpt: string;
  mediaUrls: string[];
  whyPicked: string;
  status: FindingStatus;
  voice: VoiceMode;
  threadJson: ThreadTweet[];
  postedThreadUrl: string | null;
  dryRun: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FindingRow = {
  id: string;
  source_key: string;
  title: string;
  summary: string;
  repo_full_name: string;
  repo_url: string;
  readme_excerpt: string;
  media_urls: string;
  why_picked: string;
  status: FindingStatus;
  voice: VoiceMode;
  thread_json: string;
  posted_thread_url: string | null;
  dry_run: number;
  created_at: string;
  updated_at: string;
};
