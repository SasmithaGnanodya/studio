'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Zap, ShieldCheck, BarChart3, Users, LayoutTemplate, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              <Zap size={14} /> The Enterprise Standard
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground leading-tight">
              Precision Engineering for <span className="text-primary">Vehicle Valuation</span>.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Drive Care Report Gen is a specialized platform designed to bridge the gap between technical vehicle inspection and professional financial reporting.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-3 bg-primary/10 w-fit rounded-xl mb-2">
                  <LayoutTemplate className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Layout Versioning</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Every report is tied to the specific visual template it was created with. Even as standards evolve, your historical records remain pixel-perfect and audit-ready.
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-3 bg-primary/10 w-fit rounded-xl mb-2">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Secure Indexing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Critical identifiers like Engine and Chassis numbers are indexed in real-time using high-performance search queries, ensuring instant record retrieval across millions of entries.
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="p-3 bg-primary/10 w-fit rounded-xl mb-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">Audit Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Every save operation is logged with a high-resolution timestamp and user identity, providing a complete chain of custody for every vehicle valuation in the system.
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center bg-card rounded-3xl p-8 sm:p-12 border border-primary/10 shadow-2xl">
            <div className="space-y-6">
              <h2 className="text-3xl font-black tracking-tight">Built on a Modern Stack</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Next.js 15 & React 19</h4>
                    <p className="text-xs text-muted-foreground">Utilizing the latest in server components and high-performance client rendering for a seamless user interface.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Firebase Cloud Infrastructure</h4>
                    <p className="text-xs text-muted-foreground">Enterprise-grade security rules and real-time database synchronization powered by Google Cloud.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Genkit AI Integration</h4>
                    <p className="text-xs text-muted-foreground">Future-proofed with generative AI capabilities for automated data extraction and technical analysis.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl border border-dashed p-8 flex flex-col justify-center h-full min-h-[250px]">
               <div className="space-y-2 opacity-70">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Design & Engineering</p>
                  <p className="text-xs font-medium text-foreground">ceylonar B2B solutions</p>
                  <a 
                    href="https://ceylonar.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 transition-all"
                  >
                    ceylonar.com <ExternalLink size={10} />
                  </a>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
