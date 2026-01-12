import { FileText, Shield } from 'lucide-react';
import Link from 'next/link';
import { UserNav } from './UserNav';
import { useFirebase } from '@/firebase';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];

export function Header() {
  const { user } = useFirebase();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  return (
    <header className="border-b bg-card sticky top-0 z-10 no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link href="/" passHref>
            <div className="flex items-center gap-3 cursor-pointer">
              <FileText className="h-7 w-7 text-primary" />
              <h1 className="text-xl font-bold tracking-tight">
                Valuation Report Generator
              </h1>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            {isAdmin && (
               <Link href="/admin" passHref>
                  <div className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary">
                    <Shield size={18} />
                    Admin
                  </div>
              </Link>
            )}
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
