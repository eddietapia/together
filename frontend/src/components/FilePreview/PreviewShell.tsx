import type { ReactNode } from 'react';

export function PreviewLoading() {
  return (
    <div className="px-3 py-4 text-xs text-muted-foreground animate-pulse">
      Loading file…
    </div>
  );
}

export function PreviewError({ message }: { message: string }) {
  return (
    <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
      {message}
    </div>
  );
}

export function PreviewMissing({ label }: { label: string }) {
  return (
    <div className="px-3 py-4 text-xs text-muted-foreground bg-[#fffdf7] border border-dashed border-border rounded-md text-center">
      {label}
    </div>
  );
}

export function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-white">
      {children}
    </div>
  );
}
