'use client';

import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, Info, CheckCircle2, Lock, Database, Zap } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    // Ensuring the year is correct on client side to avoid hydration mismatch
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-background border-t py-12 px-4 sm:px-6 lg:px-8 mt-auto no-print">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand and Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Drive Care Report Gen</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Generating professional vehicle valuation reports with industry-leading precision, secure real-time indexing, and layout-aware versioning.
            </p>
          </div>

          {/* Details & Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Info size={16} /> System Details
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home & Search Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Admin Analytics Panel
                </Link>
              </li>
              <li>
                <Link href="/editor" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Master Layout Editor
                </Link>
              </li>
            </ul>
          </div>

          {/* Verification & Security */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <ShieldCheck size={16} /> System Verification
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-primary" />
                  <span>Data Sovereignty</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={12} />
                  <span>VERIFIED</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-primary" />
                  <span>Encryption Layer</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={12} />
                  <span>SECURE</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-primary" />
                  <span>Cloud Database</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={12} />
                  <span>CERTIFIED</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-primary" />
                  <span>Layout Engine</span>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={12} />
                  <span>OPTIMIZED</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-muted-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            &copy; {year} Drive Care Valuation Services. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
             <span>System v1.2.4</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Privacy</span>
             <span className="hover:text-primary cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
