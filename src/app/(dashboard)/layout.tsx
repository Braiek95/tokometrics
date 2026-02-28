import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DashboardShell } from "./dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const shops = await prisma.shop.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      status: true,
      avatarUrl: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <DashboardShell shops={shops}>{children}</DashboardShell>;
}
