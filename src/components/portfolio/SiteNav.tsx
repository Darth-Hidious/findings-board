import Link from "next/link";
import { getConfig } from "@/lib/config";

export function SiteNav() {
  const config = getConfig();
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[rgba(11,15,20,0.72)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="display text-lg tracking-tight">
          {config.siteName}
        </Link>
        <nav className="mono flex items-center gap-5 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <a href="#findings" className="hover:text-[var(--ink)]">
            Findings
          </a>
          <Link href="/board" className="hover:text-[var(--ink)]">
            Board
          </Link>
        </nav>
      </div>
    </header>
  );
}
