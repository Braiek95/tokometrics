import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
