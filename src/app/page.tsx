import Link from "next/link";
import { getConfig, githubProfileUrl, xProfileUrl } from "@/lib/config";
import { listPublicFindings } from "@/lib/db";
import { FindingsFeed } from "@/components/portfolio/FindingsFeed";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const config = getConfig();
  const findings = listPublicFindings();
  const github = githubProfileUrl(config.githubUsername);
  const x = xProfileUrl(config.xHandle);

  return (
    <div className="page">
      <header className="site-header">
        <h1>{config.siteName}</h1>
        <p className="meta">
          Engineering student · Technische Hochschule Mittelhessen (THM),
          Gießen
        </p>
        <nav>
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#findings">Findings</a>
          <a href={github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={x} target="_blank" rel="noreferrer">
            X/@{config.xHandle}
          </a>
          <Link href="/board">Posting board</Link>
        </nav>
      </header>

      <hr />

      <section id="about">
        <h2>About</h2>
        <p>
          I work on navigation, sensor fusion, and materials / ISRU-adjacent
          analysis. Most of the serious output lives in public repositories.
          This page is a quiet index of that work — not a product landing page.
        </p>
        <p className="muted">
          {config.siteTagline} Threads get drafted on the private board, then
          posted to X when they are ready.
        </p>
      </section>

      <section id="work">
        <h2>Selected work</h2>
        <ul>
          <li>
            <a
              href="https://github.com/Darth-Hidious/kc-ukf"
              target="_blank"
              rel="noreferrer"
            >
              KC-UKF
            </a>{" "}
            — kinematic compatibility-field UKF for multi-sensor fusion under
            adversarial degradation (THM student research).
          </li>
          <li>
            <a
              href="https://github.com/Darth-Hidious/kc-ukf-nav"
              target="_blank"
              rel="noreferrer"
            >
              kc-ukf-nav
            </a>{" "}
            — spoof-resilient GNSS/INS navigation via cross-sensor trust
            (IEEE NAVICON 2026 submission).
          </li>
          <li>
            <a
              href="https://github.com/Darth-Hidious/wams2026-lunar-metallurgy"
              target="_blank"
              rel="noreferrer"
            >
              wams2026-lunar-metallurgy
            </a>{" "}
            — terrane-aware lunar metallurgy analysis pipeline (WAMS 2026).
          </li>
          <li>
            <a
              href="https://github.com/Darth-Hidious/PRISM"
              target="_blank"
              rel="noreferrer"
            >
              PRISM
            </a>{" "}
            — AI-native autonomous materials discovery platform.
          </li>
        </ul>
        <p className="meta">
          Full list:{" "}
          <a href={github} target="_blank" rel="noreferrer">
            github.com/{config.githubUsername}
          </a>
        </p>
      </section>

      <FindingsFeed findings={findings} xHandle={config.xHandle} />

      <hr />
      <footer className="meta">
        <p>
          Contact via GitHub or X. Site source is this Findings Board app.
          Hosted as described in <code>HOSTING.md</code>.
        </p>
      </footer>
    </div>
  );
}
