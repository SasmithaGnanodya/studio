'use client';

import { FileText, Shield, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { UserNav } from './UserNav';
import { useFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];

export function Header() {
  const { user } = useFirebase();
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme from localStorage on mount
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
      
      // If scrolling down and past a threshold (100px), hide the header
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      // If scrolling up, show the header
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
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
              <div className="flex items-center gap-3 cursor-pointer">
                <FileText className="h-7 w-7 text-primary" />
                <h1 className="text-xl font-bold tracking-tight">
                  Drive Care Report Gen
                </h1>
              </div>
            </Link>
            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="rounded-full w-9 h-9 text-muted-foreground hover:text-primary transition-colors"
                title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>

              {isAdmin && (
                 <Link href="/admin" passHref>
                    <div className="flex items-center gap-2 cursor-pointer text-sm font-medium text-muted-foreground hover:text-primary transition-colors pr-2">
                      <Shield size={18} />
                      <span className="hidden sm:inline">Admin</span>
                    </div>
                </Link>
              )}
              <UserNav />
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to prevent layout jump as the header is fixed */}
      <div className="h-16 w-full no-print" />
    </>
  );
}