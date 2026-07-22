import Link from "next/link";
import { getConfig, githubProfileUrl, xProfileUrl } from "@/lib/config";
import { listPublicFindings } from "@/lib/db";
import { FindingsFeed } from "@/components/portfolio/FindingsFeed";
import { SiteHeader } from "@/components/portfolio/SiteHeader";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const config = getConfig();
  const findings = listPublicFindings();
  const github = githubProfileUrl(config.githubUsername);
  const x = xProfileUrl(config.xHandle);
  const linkedin =
    "https://www.linkedin.com/in/siddhartha-yash-kovid-2688891a8/";

  return (
    <>
      <SiteHeader />
      <main className="shell">
        <article className="panel hero">
          <p className="eyebrow">Curriculum vitae · portfolio</p>
          <h1>{config.siteName}</h1>
          <p className="lede">
            Technical lead at the intersection of autonomous R&amp;D, advanced
            materials, and aerospace systems. Funded programs, research
            consortia, and deployable AI prototypes.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/cv.pdf" target="_blank" rel="noreferrer">
              Download CV
            </a>
            <a className="btn" href={github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn" href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="btn" href={x} target="_blank" rel="noreferrer">
              @{config.xHandle}
            </a>
          </div>
          <div className="pill-row">
            <span className="pill">AI / materials</span>
            <span className="pill">Aerospace</span>
            <span className="pill">Navigation</span>
            <span className="pill">THM · expected 2027</span>
          </div>
        </article>

        <section className="panel section" id="about">
          <div className="section-head">
            <h2>About</h2>
            <p>What I work on, without the launch-speak.</p>
          </div>
          <p>
            I lead and found work across autonomous discovery, extreme-temperature
            propulsion materials, and spoof-resilient navigation / state
            estimation. The through-line is turning hard technical ideas into
            funded, partnered programs that institutions can actually run.
          </p>
          <p className="muted">
            {config.siteTagline} Most of the serious output lives in
            repositories. This page is the public index.
          </p>
        </section>

        <section className="panel section" id="impact">
          <div className="section-head">
            <h2>Selected impact</h2>
            <p>Markers from recent programs and recognition.</p>
          </div>
          <ul className="impact-grid">
            <li className="impact-item">
              <strong>2 ESA prime projects</strong>
              <span>Secured and led under Bimo Tech consortia</span>
            </li>
            <li className="impact-item">
              <strong>EIC Seal of Excellence</strong>
              <span>Horizon Europe / EIC Pre-Accelerator, 2026</span>
            </li>
            <li className="impact-item">
              <strong>WAMS 26 · ESA ESTEC</strong>
              <span>Invited speaker and accepted paper</span>
            </li>
            <li className="impact-item">
              <strong>StartMiUp winner</strong>
              <span>Hackathon MVP architect, Abicor Binzel challenge</span>
            </li>
          </ul>
        </section>

        <section className="panel section" id="work">
          <div className="section-head">
            <h2>Selected work</h2>
            <p>Programs and public technical artifacts.</p>
          </div>
          <ul className="work-list">
            <li>
              <h3>Autonomous material discovery</h3>
              <p className="work-meta">ESA / NASA framework · related: PRISM</p>
              <p>
                Agentic, closed-loop discovery pipeline combining ML with
                self-driving laboratory ideas for extreme-temperature space
                materials.{" "}
                <a
                  href="https://github.com/Darth-Hidious/PRISM"
                  target="_blank"
                  rel="noreferrer"
                >
                  github.com/Darth-Hidious/PRISM
                </a>
              </p>
            </li>
            <li>
              <h3>Project SPARK</h3>
              <p className="work-meta">
                ESA-funded consortium · ArianeGroup, IPPT PAN
              </p>
              <p>
                Extreme-temperature alloys for next-generation space propulsion
                inside a multi-institution European program.
              </p>
            </li>
            <li>
              <h3>KC-UKF / spoof-resilient navigation</h3>
              <p className="work-meta">NAVICON 2026 · Zenodo preprint</p>
              <p>
                Kinematic compatibility-field UKF for multi-sensor fusion and
                cross-sensor trust in GNSS/INS under adversarial degradation.{" "}
                <a
                  href="https://github.com/Darth-Hidious/kc-ukf"
                  target="_blank"
                  rel="noreferrer"
                >
                  kc-ukf
                </a>
                {" · "}
                <a
                  href="https://github.com/Darth-Hidious/kc-ukf-nav"
                  target="_blank"
                  rel="noreferrer"
                >
                  kc-ukf-nav
                </a>
              </p>
            </li>
            <li>
              <h3>Lunar metallurgy analysis</h3>
              <p className="work-meta">WAMS 2026 · ESA ESTEC</p>
              <p>
                Terrane-aware lunar metallurgy framework and analysis pipeline.{" "}
                <a
                  href="https://github.com/Darth-Hidious/wams2026-lunar-metallurgy"
                  target="_blank"
                  rel="noreferrer"
                >
                  repository
                </a>
              </p>
            </li>
            <li>
              <h3>Differentiable ML modeling</h3>
              <p className="work-meta">
                Horizon Europe / EIC Pre-Accelerator · Fraunhofer
              </p>
              <p>
                Production scale-up proposal work awarded the EIC Seal of
                Excellence; co-developing differentiable models for complex fluid
                / pool dynamics.
              </p>
            </li>
          </ul>
        </section>

        <section className="panel section" id="credentials">
          <div className="section-head">
            <h2>Education &amp; credentials</h2>
            <p>Background without dumping every line of the PDF.</p>
          </div>
          <div className="creds">
            <div className="cred">
              <h3>THM</h3>
              <p className="meta">B.Sc. Medical Engineering · expected 2027</p>
            </div>
            <div className="cred">
              <h3>MIT Professional Education</h3>
              <p className="meta">Applied AI &amp; Data Science · 2026</p>
            </div>
            <div className="cred">
              <h3>IEEE</h3>
              <p className="meta">Member</p>
            </div>
            <div className="cred">
              <h3>Languages</h3>
              <p className="meta">German C1 · English C1 · Hindi native</p>
            </div>
          </div>
          <p className="meta" style={{ marginTop: "1rem" }}>
            Full detail: <a href="/cv.pdf">cv.pdf</a>
          </p>
        </section>

        <FindingsFeed findings={findings} xHandle={config.xHandle} />

        <footer className="site-footer">
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
            <a href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            . Location and phone are not published on this page.
          </p>
          <p>
            <Link href="/board">Posting board</Link> is private.
          </p>
        </footer>
      </main>
    </>
  );
}
