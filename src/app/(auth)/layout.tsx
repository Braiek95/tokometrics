import { redirect } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Direct-access mode: login/register are disabled — send users straight in.
  if (process.env.DISABLE_AUTH === "true") {
    redirect("/shops");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
