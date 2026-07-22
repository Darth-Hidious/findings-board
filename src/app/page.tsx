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
          Technical lead · AI, aerospace &amp; materials systems
        </p>
        <nav>
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="#findings">Findings</a>
          <a href="/cv.pdf" target="_blank" rel="noreferrer">
            CV
          </a>
          <a href={github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={x} target="_blank" rel="noreferrer">
            X/@{config.xHandle}
          </a>
          <a
            href="https://www.linkedin.com/in/siddhartha-yash-kovid-2688891a8/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          <Link href="/board">Posting board</Link>
        </nav>
      </header>

      <hr />

      <section id="about">
        <h2>About</h2>
        <p>
          Technical lead and founder working at the intersection of autonomous
          R&amp;D, advanced materials, and aerospace systems. I build funded
          programs, research consortia, and deployable AI prototypes from first
          concept through institutional adoption.
        </p>
        <p>
          Current focus: agentic materials discovery, extreme-temperature
          propulsion materials, and spoof-resilient navigation / state
          estimation.
        </p>
        <p className="muted">
          {config.siteTagline} Serious output lives in repositories; this page
          is a quiet index. Threads are drafted on the private board, then
          posted when ready.
        </p>
      </section>

      <section id="work">
        <h2>Selected work</h2>
        <ul>
          <li>
            <strong>Autonomous material discovery</strong> — agentic,
            closed-loop pipeline for extreme-temperature space materials (ESA /
            NASA framework). Related public work:{" "}
            <a
              href="https://github.com/Darth-Hidious/PRISM"
              target="_blank"
              rel="noreferrer"
            >
              PRISM
            </a>
            .
          </li>
          <li>
            <strong>Project SPARK</strong> — ESA-funded extreme-temperature
            alloys for next-generation propulsion (consortium with ArianeGroup,
            IPPT PAN).
          </li>
          <li>
            <a
              href="https://github.com/Darth-Hidious/kc-ukf"
              target="_blank"
              rel="noreferrer"
            >
              KC-UKF
            </a>{" "}
            /{" "}
            <a
              href="https://github.com/Darth-Hidious/kc-ukf-nav"
              target="_blank"
              rel="noreferrer"
            >
              kc-ukf-nav
            </a>{" "}
            — kinematic compatibility-field UKF; spoof-resilient GNSS/INS
            cross-sensor trust (NAVICON 2026).
          </li>
          <li>
            <a
              href="https://github.com/Darth-Hidious/wams2026-lunar-metallurgy"
              target="_blank"
              rel="noreferrer"
            >
              Lunar metallurgy analysis
            </a>{" "}
            — terrane-aware framework; WAMS 26 invited talk at ESA ESTEC.
          </li>
          <li>
            <strong>Differentiable ML modeling</strong> — Horizon Europe / EIC
            Pre-Accelerator work with Fraunhofer; EIC Seal of Excellence, 2026.
          </li>
        </ul>
        <p className="meta">
          Public repositories:{" "}
          <a href={github} target="_blank" rel="noreferrer">
            github.com/{config.githubUsername}
          </a>
          . Private program work is ingested on the board when a GitHub token is
          configured — not listed here by default.
        </p>
      </section>

      <section id="notes">
        <h2>Notes</h2>
        <ul>
          <li>B.Sc. Medical Engineering, THM — expected 2027.</li>
          <li>MIT Professional Education — Applied AI &amp; Data Science (2026).</li>
          <li>IEEE member.</li>
          <li>
            PDF curriculum vitae: <a href="/cv.pdf">cv.pdf</a>.
          </li>
        </ul>
      </section>

      <FindingsFeed findings={findings} xHandle={config.xHandle} />

      <hr />
      <footer className="meta">
        <p>
          Contact via{" "}
          <a href={github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          ,{" "}
          <a href={x} target="_blank" rel="noreferrer">
            X
          </a>
          , or{" "}
          <a
            href="https://www.linkedin.com/in/siddhartha-yash-kovid-2688891a8/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
          . No street address on this page.
        </p>
      </footer>
    </div>
  );
}
