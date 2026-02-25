'use client';

import { Shield, Moon, Sun, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { UserNav } from './UserNav';
import { useFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import Image from 'next/image';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const SUPER_ADMIN_EMAIL = 'sasmithagnanodya@gmail.com';

export function Header() {
  const { user } = useFirebase();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) setIsVisible(false);
      else if (currentScrollY < lastScrollY) setIsVisible(true);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <header 
        className={cn(
          "border-b bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 no-print transition-transform duration-300 ease-in-out shadow-sm",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link href="/" passHref>
              <div className="flex items-center cursor-pointer">
                <Image 
                  src="https://i.postimg.cc/k5HnDh4Q/care-drive.jpg" 
                  alt="CareDrive Logo" 
                  width={160} 
                  height={48} 
                  className="h-12 w-auto object-contain rounded-md"
                  priority
                />
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <Link href="/about" passHref>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <Info size={18} />
                  <span>About</span>
                </Button>
              </Link>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full w-9 h-9 text-muted-foreground hover:text-primary transition-colors"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>

              {isSuperAdmin && (
                <Link href="/super-admin" passHref>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 text-primary font-black text-[10px] uppercase hover:bg-primary/5 transition-colors">
                    <ShieldCheck size={18} />
                    <span className="hidden sm:inline">Super Admin</span>
                  </Button>
                </Link>
              )}

              {isAdmin && (
                 <Link href="/admin" passHref>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors pr-2">
                      <Shield size={18} />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                </Link>
              )}
              <UserNav />
            </div>
          </div>
        </div>
      </header>
      <div className="h-16 w-full no-print" />
    </>
  );
}
