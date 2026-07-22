import Link from "next/link";
import { getConfig } from "@/lib/config";

export function SiteHeader() {
  const config = getConfig();
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          {config.siteName}
        </Link>
        <nav className="top-nav" aria-label="Primary">
          <a href="#about">About</a>
          <a href="#work">Work</a>
          <a href="/cv.pdf" target="_blank" rel="noreferrer">
            CV
          </a>
          <Link href="/board">Board</Link>
        </nav>
      </div>
    </header>
  );
}
