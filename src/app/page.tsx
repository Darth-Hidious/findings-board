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
          <h1>{config.siteName}</h1>
          <p className="lede">
            Materials software, spoof-resilient navigation, aerospace systems.
            Technical lead on two ESA projects.
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
            <span className="pill">Materials</span>
            <span className="pill">Navigation</span>
            <span className="pill">Aerospace</span>
            <span className="pill">THM · 2027</span>
          </div>
        </section>

        <section className="panel section" id="now">
          <div className="section-head">
            <h2>Now</h2>
          </div>
          <p>
            Building{" "}
            <a
              href="https://github.com/Darth-Hidious/PRISM"
              target="_blank"
              rel="noreferrer"
            >
              PRISM
            </a>
            , a Rust CLI for materials discovery (knowledge graph, compute,
            mesh).{" "}
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
          </div>
          <p>
            I build materials software and navigation filters for spoofed GNSS.
          </p>
        </section>

        <section className="panel section" id="impact">
          <div className="section-head">
            <h2>Recognition</h2>
          </div>
          <ul className="impact-grid">
            <li className="impact-item">
              <strong>Technical lead · 2 ESA projects</strong>
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
            <h2>Work</h2>
          </div>
          <ul className="work-list">
            <li>
              <h3>KC-UKF</h3>
              <p className="work-meta">NAVICON 2026</p>
              <p>
                UKF with cross-sensor trust for GNSS/INS under spoofing. Report,
                verification suite, KITTI package.{" "}
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
              <h3>PRISM</h3>
              <p className="work-meta">Current</p>
              <p>
                Materials agent / CLI.{" "}
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
              <h3>Lunar metallurgy</h3>
              <p className="work-meta">WAMS 2026</p>
              <p>
                Analysis pipeline for the WAMS paper.{" "}
                <a
                  href="https://github.com/Darth-Hidious/wams2026-lunar-metallurgy"
                  target="_blank"
                  rel="noreferrer"
                >
                  repo
                </a>
                {" · "}
                <Link href="/notes/wams2026-lunar-metallurgy">note</Link>
              </p>
            </li>
            <li>
              <h3>Vingilot Mk01</h3>
              <p className="work-meta">Code-CAD</p>
              <p>
                CadQuery modules → STEP → Onshape for a VTOL airframe.{" "}
                <a
                  href="https://github.com/Darth-Hidious/Vingilot.mk01.manta"
                  target="_blank"
                  rel="noreferrer"
                >
                  repo
                </a>
                {" · "}
                <Link href="/notes/vingilot">note</Link>
              </p>
            </li>
          </ul>
        </section>

        <section className="panel section" id="credentials">
          <div className="section-head">
            <h2>Education</h2>
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
            CV: <a href="/cv.pdf">cv.pdf</a>
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
