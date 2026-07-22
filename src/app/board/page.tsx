import { redirect } from "next/navigation";
import { isBoardAuthenticated } from "@/lib/auth";
import { listFindings } from "@/lib/db";
import { BoardDesk } from "@/components/board/BoardDesk";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  if (!(await isBoardAuthenticated())) {
    redirect("/board/login");
  }

  const findings = listFindings();
  return <BoardDesk initialFindings={findings} />;
}
