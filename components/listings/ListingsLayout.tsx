import type { ReactNode } from "react";

interface ListingsLayoutProps {
  searchMode: boolean;
  toolbar: ReactNode;
  sidebar: ReactNode;
  resultsHeader: ReactNode;
  activeFilters: ReactNode;
  children: ReactNode;
}

export function ListingsLayout({
  searchMode,
  toolbar,
  sidebar,
  resultsHeader,
  activeFilters,
  children,
}: ListingsLayoutProps) {
  if (!searchMode) {
    return (
      <div>
        {toolbar}
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toolbar}
      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div>{sidebar}</div>
        <div className="space-y-4">
          {resultsHeader}
          {activeFilters}
          {children}
        </div>
      </div>
    </div>
  );
}
