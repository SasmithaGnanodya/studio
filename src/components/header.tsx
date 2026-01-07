import { FileText } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-card sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Valuation Report Generator
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
