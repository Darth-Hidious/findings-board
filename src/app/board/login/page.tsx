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
      <header className="site-header">
        <h1>Findings board — login</h1>
        <p className="meta">
          Private posting desk. Use the password from your Vercel env
          (<code>BOARD_PASSWORD</code>). Do not share it in chat.
        </p>
        <nav>
          <Link href="/">Home</Link>
        </nav>
      </header>
      <hr />
      <LoginForm />
    </div>
  );
}
