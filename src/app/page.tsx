import Link from "next/link";
import { getConfig, githubProfileUrl, xProfileUrl } from "@/lib/config";
import { listPublicFindings } from "@/lib/db";
import { FindingsFeed } from "@/components/portfolio/FindingsFeed";
import { RepoNews } from "@/components/portfolio/RepoNews";
import { SiteHeader } from "@/components/portfolio/SiteHeader";
import { getProjectNotes } from "@/lib/notes";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const config = getConfig();
  const findings = listPublicFindings();
  const notes = await getProjectNotes();
  const github = githubProfileUrl(config.githubUsername);
  const x = xProfileUrl(config.xHandle);
  const linkedin =
    "https://www.linkedin.com/in/siddhartha-yash-kovid-2688891a8/";

  return (
    <>
      <SiteHeader />
      <main className="shell">
        <section className="panel hero">
          <p className="eyebrow">Notes &amp; public work</p>
          <h1>{config.siteName}</h1>
          <p className="lede">
            Materials tooling, spoof-resilient navigation, and aerospace-adjacent
            systems — with public writeups where the work can actually be shown.
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
            <span className="pill">Materials tooling</span>
            <span className="pill">Navigation</span>
            <span className="pill">Aerospace</span>
            <span className="pill">THM · 2027</span>
          </div>
        </section>

        <section className="panel section" id="now">
          <div className="section-head">
            <h2>Now</h2>
            <p>What I’m actually building.</p>
          </div>
          <p>
            Working on{" "}
            <a
              href="https://github.com/Darth-Hidious/PRISM"
              target="_blank"
              rel="noreferrer"
            >
              PRISM
            </a>
            — a public Rust CLI / agent shell for materials discovery workflows
            (knowledge graph, compute backends, research mesh). Program-side
            detail stays off this site; the installable tool is what’s public.{" "}
            <Link href="/notes/prism">Note</Link>
            {" · "}
            <a
              href="https://github.com/Darth-Hidious/PRISM"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </p>
        </section>

        <RepoNews notes={notes} />

        <section className="panel section" id="about">
          <div className="section-head">
            <h2>About</h2>
            <p>Focus areas, without hype.</p>
          </div>
          <p>
            I care about autonomous materials tooling and navigation that still
            works when sensors lie. Public artifacts live here and on GitHub;
            partner / national program material does not.
          </p>
        </section>

        <section className="panel section" id="impact">
          <div className="section-head">
            <h2>Selected markers</h2>
            <p>Public recognition only — not a program dump.</p>
          </div>
          <ul className="impact-grid">
            <li className="impact-item">
              <strong>Technical lead · 2 ESA projects</strong>
              <span>Program detail stays off this site</span>
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
            <h2>Public technical work</h2>
            <p>Things with repos, papers, or notes you can open.</p>
          </div>
          <ul className="work-list">
            <li>
              <h3>KC-UKF / spoof-resilient navigation</h3>
              <p className="work-meta">Paper + code on GitHub · NAVICON 2026</p>
              <p>
                Compatibility-field UKF for multi-sensor fusion under adversarial
                degradation — report, verification ledger, and KITTI navigation
                package.{" "}
                <a
                  href="https://github.com/Darth-Hidious/kc-ukf"
                  target="_blank"
                  rel="noreferrer"
                >
                  kc-ukf
                </a>
                {" · "}
                <a
                  href="https://github.com/Darth-Hidious/kc-ukf/blob/main/paper/KC-UKF_Research_Report.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  paper PDF
                </a>
                {" · "}
                <a
                  href="https://doi.org/10.5281/zenodo.19506045"
                  target="_blank"
                  rel="noreferrer"
                >
                  Zenodo
                </a>
                {" · "}
                <a
                  href="https://github.com/Darth-Hidious/kc-ukf-nav"
                  target="_blank"
                  rel="noreferrer"
                >
                  kc-ukf-nav
                </a>
                {" · "}
                <Link href="/notes/kc-ukf-nav">note</Link>
              </p>
            </li>
            <li>
              <h3>PRISM (public tool)</h3>
              <p className="work-meta">Current focus · open-source CLI</p>
              <p>
                Materials agent / CLI — what’s public is the binary and docs, not
                partner program writeups.{" "}
                <a
                  href="https://github.com/Darth-Hidious/PRISM"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                {" · "}
                <Link href="/notes/prism">note</Link>
              </p>
            </li>
            <li>
              <h3>Lunar metallurgy analysis</h3>
              <p className="work-meta">WAMS 2026 · public pipeline</p>
              <p>
                Terrane-aware lunar metallurgy analysis stack.{" "}
                <a
                  href="https://github.com/Darth-Hidious/wams2026-lunar-metallurgy"
                  target="_blank"
                  rel="noreferrer"
                >
                  repository
                </a>
                {" · "}
                <Link href="/notes/wams2026-lunar-metallurgy">note</Link>
              </p>
            </li>
            <li>
              <h3>Vingilot Mk01</h3>
              <p className="work-meta">Code-CAD</p>
              <p>
                Modular CadQuery → STEP → Onshape workflow for a VTOL airframe.{" "}
                <a
                  href="https://github.com/Darth-Hidious/Vingilot.mk01.manta"
                  target="_blank"
                  rel="noreferrer"
                >
                  repository
                </a>
                {" · "}
                <Link href="/notes/vingilot">note</Link>
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
