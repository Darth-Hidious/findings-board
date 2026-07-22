import Link from "next/link";
import { redirect } from "next/navigation";
import { isBoardAuthenticated } from "@/lib/auth";
import { LoginForm } from "@/components/board/LoginForm";

export default async function BoardLoginPage() {
  if (await isBoardAuthenticated()) {
    redirect("/board");
  }

  return (
    <div className="page">
      <div className="board-shell">
        <header className="site-header">
          <h1>Board login</h1>
          <p className="meta">
            Password is <code>BOARD_PASSWORD</code> in Vercel env.
          </p>
          <nav>
            <Link href="/">Home</Link>
          </nav>
        </header>
        <hr />
        <LoginForm />
      </div>
    </div>
  );
}
