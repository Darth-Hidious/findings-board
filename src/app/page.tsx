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
        <section className="panel hero">
          <p className="eyebrow">CV / portfolio</p>
          <h1>{config.siteName}</h1>
          <p className="lede">
            Technical lead working across autonomous R&amp;D, advanced
            materials, and aerospace systems — funded programs, consortia, and
            prototypes that ship into institutions.
          </p>
          <div className="hero-actions">
            <a
              className="btn btn-primary"
              href="/cv.pdf"
              target="_blank"
              rel="noreferrer"
            >
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
            <span className="pill">THM · 2027</span>
          </div>
        </section>

        <section className="panel section" id="about">
          <div className="section-head">
            <h2>About</h2>
            <p>Focus areas, without hype.</p>
          </div>
          <p>
            I lead work in autonomous discovery, extreme-temperature propulsion
            materials, and spoof-resilient navigation. The common thread is
            taking hard technical ideas into funded, partnered programs.
          </p>
        </section>

        <section className="panel section" id="impact">
          <div className="section-head">
            <h2>Selected impact</h2>
            <p>Recent markers from programs and recognition.</p>
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
              <span>Hackathon MVP · Abicor Binzel challenge</span>
            </li>
          </ul>
        </section>

        <section className="panel section" id="work">
          <div className="section-head">
            <h2>Selected work</h2>
            <p>Programs and public technical work.</p>
          </div>
          <ul className="work-list">
            <li>
              <h3>Autonomous material discovery</h3>
              <p className="work-meta">ESA / NASA framework · PRISM</p>
              <p>
                Agentic closed-loop discovery for extreme-temperature space
                materials.{" "}
                <a
                  href="https://github.com/Darth-Hidious/PRISM"
                  target="_blank"
                  rel="noreferrer"
                >
                  PRISM
                </a>
              </p>
            </li>
            <li>
              <h3>Project SPARK</h3>
              <p className="work-meta">ESA · ArianeGroup · IPPT PAN</p>
              <p>
                Extreme-temperature alloys for next-generation space propulsion.
              </p>
            </li>
            <li>
              <h3>KC-UKF / spoof-resilient navigation</h3>
              <p className="work-meta">NAVICON 2026</p>
              <p>
                Kinematic compatibility-field UKF for GNSS/INS under adversarial
                degradation.{" "}
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
                Terrane-aware lunar metallurgy framework.{" "}
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
              <p className="work-meta">EIC Pre-Accelerator · Fraunhofer</p>
              <p>
                Differentiable models for complex fluid / pool dynamics; EIC Seal
                of Excellence.
              </p>
            </li>
          </ul>
        </section>

        <section className="panel section" id="credentials">
          <div className="section-head">
            <h2>Education &amp; credentials</h2>
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
            Full CV: <a href="/cv.pdf">cv.pdf</a>
          </p>
        </section>

        <FindingsFeed findings={findings} xHandle={config.xHandle} />

        <footer className="site-footer">
          <p>
            <a href={github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            {" · "}
            <a href={x} target="_blank" rel="noreferrer">
              X
            </a>
            {" · "}
            <a href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            {" · "}
            <Link href="/board">Board</Link>
          </p>
        </footer>
      </main>
    </>
  );
}
