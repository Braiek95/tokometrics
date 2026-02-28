"use client";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {children}
    </div>
  );
}
