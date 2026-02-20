'use client';

import React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, Scale, UserCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/10">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-primary">Terms of Service</h1>
            <p className="text-muted-foreground">Effective Date: February 2025</p>
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>1. Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  By accessing or using Drive Care Report Gen, you agree to be bound by these Terms of Service. If you do not agree to these terms, you must not use the application. These terms apply to all users, including standard users and administrators.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>2. User Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Users are responsible for the following:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Data Accuracy:</strong> Ensuring all vehicle information (registration, engine, chassis numbers) entered into the system is accurate and verified.</li>
                  <li><strong>Account Security:</strong> Maintaining the confidentiality of their login credentials and the global access password.</li>
                  <li><strong>Authorized Use:</strong> Using the system only for professional vehicle valuation purposes as authorized by their organization.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>3. System Usage & Access</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Drive Care Report Gen is a professional tool. Access is granted based on organizational requirements:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Reports are protected by a global access password to prevent unauthorized external viewing.</li>
                  <li>Administrative access is strictly limited to designated personnel for system management.</li>
                  <li>The system uses layout versioning; upgrading a report's layout is a manual user action.</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>4. Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  Drive Care Report Gen provides a platform for generating reports based on user input. We do not guarantee the market accuracy of any valuation generated. The final valuation decision rests solely with the authorized valuer and their organization. We are not liable for any financial losses resulting from data entry errors or valuation discrepancies.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
