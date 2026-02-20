'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">Privacy Policy</h1>
            <p className="text-muted-foreground">Last Updated: February 2025</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Information We Collect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Drive Care Report Gen collects information necessary to provide professional vehicle valuation services. This includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>User Identity:</strong> Email address, name, and profile picture via Google Authentication.</li>
                  <li><strong>Vehicle Data:</strong> Registration numbers, engine numbers, chassis numbers, and technical specifications provided during report generation.</li>
                  <li><strong>Activity Logs:</strong> Timestamps and user identifiers associated with report creation and modifications for audit purposes.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>How We Use Your Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Your data is used strictly for internal operational purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Generating and storing professional valuation reports.</li>
                  <li>Providing a real-time searchable database of vehicle records.</li>
                  <li>Maintaining an audit trail of system activity to ensure data integrity.</li>
                  <li>Managing system access and security via administrative controls.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  We prioritize the security of your vehicle records:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols.</li>
                  <li><strong>Access Control:</strong> Strict Firebase Security Rules ensure that only authorized users can access or modify specific records.</li>
                  <li><strong>Infrastructure:</strong> We leverage Google Cloud's enterprise-grade infrastructure via Firebase for robust data protection.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  As a user of Drive Care Report Gen, you have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and review any reports you have generated.</li>
                  <li>Request correction of inaccurate vehicle identifiers.</li>
                  <li>Request the deletion of your account and associated data, subject to regulatory record-keeping requirements.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
