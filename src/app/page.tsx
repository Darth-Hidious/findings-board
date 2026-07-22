import Link from "next/link";
import { getConfig, githubProfileUrl, xProfileUrl } from "@/lib/config";
import { listPublicFindings } from "@/lib/db";
import { FindingsFeed } from "@/components/portfolio/FindingsFeed";
import { SiteNav } from "@/components/portfolio/SiteNav";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const config = getConfig();
  const findings = listPublicFindings();
  const heroFinding = findings[0];
  const github = config.githubUsername
    ? githubProfileUrl(config.githubUsername)
    : "https://github.com";
  const x = config.xHandle ? xProfileUrl(config.xHandle) : "https://x.com";

  return (
    <>
      <SiteNav />
      <main>
        <section className="relative min-h-[100svh] overflow-hidden">
          <div
            className="hero-media absolute inset-0"
            style={{
              backgroundImage: heroFinding?.mediaUrls[0]
                ? `linear-gradient(90deg, rgba(11,15,20,0.92) 0%, rgba(11,15,20,0.55) 42%, rgba(11,15,20,0.35) 100%), url(${heroFinding.mediaUrls[0]})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!heroFinding?.mediaUrls[0] && (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(198,245,76,0.16),transparent_42%),linear-gradient(135deg,#101820,#0b0f14_55%,#15100e)]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(11,15,20,0.95)_100%)]" />
          </div>

          <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:px-10 md:pb-20">
            <p className="rise mono mb-4 text-xs uppercase tracking-[0.24em] text-[var(--accent)]">
              Portfolio · Findings · Threads
            </p>
            <h1 className="rise display max-w-4xl text-5xl leading-[0.95] text-[var(--ink)] md:text-7xl lg:text-8xl">
              {config.siteName}
            </h1>
            <p
              className="rise mt-6 max-w-xl text-lg text-[var(--muted)] md:text-xl"
              style={{ animationDelay: "80ms" }}
            >
              {config.siteTagline} Cool shit from the repos, drafted dry, with
              jokes that have a second floor.
            </p>
            <div
              className="rise mt-10 flex flex-wrap gap-3"
              style={{ animationDelay: "140ms" }}
            >
              <a className="btn btn-primary" href="#findings">
                See findings
              </a>
              <Link className="btn btn-ghost" href="/board">
                Open board
              </Link>
              <a className="btn btn-ghost" href={github} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="btn btn-ghost" href={x} target="_blank" rel="noreferrer">
                @{config.xHandle || "x"}
              </a>
            </div>
          </div>
        </section>

        <FindingsFeed findings={findings} xHandle={config.xHandle} />
      </main>
    </>
  );
}
