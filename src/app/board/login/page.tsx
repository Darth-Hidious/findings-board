import Link from "next/link";
import { redirect } from "next/navigation";
import { isBoardAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/board/LoginForm";

export default async function BoardLoginPage() {
  if (await isBoardAuthenticated()) {
    redirect("/board");
  }

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-center px-6 py-20 md:px-10">
      <p className="mono mb-3 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
        Private desk
      </p>
      <h1 className="display mb-3 text-5xl">Findings board</h1>
      <p className="mb-10 max-w-lg text-[var(--muted)]">
        Draft dry threads with bones. Approve once. Post for real when X keys
        are set — otherwise dry-run.
      </p>
      <LoginForm />
      <p className="mono mt-10 text-xs text-[var(--muted)]">
        Default password is in <code>.env.example</code>. Change it.
      </p>
      <Link href="/" className="sr-only">
        Home
      </Link>
    </main>
  );
}
