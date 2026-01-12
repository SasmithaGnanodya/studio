
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield, Edit, History } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, onSnapshot, orderBy } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_EMAILS = ['sasmithagnanodya@gmail.com', 'supundinushaps@gmail.com', 'caredrivelk@gmail.com'];
const INITIAL_VISIBLE_REPORTS = 6;

function ReportStats({ reports }: { reports: Report[] }) {
    const totalCount = useMemo(() => {
        if (!reports || reports.length === 0) return 0;
        return reports.length;
    }, [reports]);

    return (
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{totalCount}</div>
                <p className="text-xs text-muted-foreground">
                    Number of reports in the system
                </p>
            </CardContent>
        </Card>
    )
}

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [visibleReportsCount, setVisibleReportsCount] = useState(INITIAL_VISIBLE_REPORTS);

  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();

  const isAdmin = useMemo(() => {
    return user?.email && ADMIN_EMAILS.includes(user.email);
  }, [user]);

  // Effect for handling live search results
  useEffect(() => {
    if (!user || !firestore || searchTerm.length < 1) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setIsSearching(true);
    const debounceTimeout = setTimeout(async () => {
      const reportsRef = collection(firestore, `reports`);
      const q = query(
        reportsRef,
        where('vehicleId', '>=', searchTerm.toUpperCase()),
        where('vehicleId', '<=', searchTerm.toUpperCase() + '\uf8ff'),
        limit(10)
      );

      try {
        const querySnapshot = await getDocs(q);
        const results: Report[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) });
        });
        setSearchResults(results);
        setNoResults(results.length === 0);
      } catch (error) {
        console.error("Error searching reports: ", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, firestore, user]);

  // Effect for fetching all reports for statistics and admin list
   useEffect(() => {
    if (user && firestore) { // Fetch for any logged-in user
      setIsLoadingReports(true);
      const reportsRef = collection(firestore, 'reports');
      const q = query(reportsRef, orderBy('updatedAt', 'desc'));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedReports: Report[] = [];
        querySnapshot.forEach((doc) => {
          fetchedReports.push({ id: doc.id, ...(doc.data() as Omit<Report, 'id'>) });
        });
        setAllReports(fetchedReports);
        setIsLoadingReports(false);
      }, (error) => {
        console.error("Error fetching all reports: ", error);
        setIsLoadingReports(false);
      });

      return () => unsubscribe();
    } else {
        setAllReports([]);
        setIsLoadingReports(false);
    }
  }, [user, firestore]);

  const handleCreateNew = () => {
    if (searchTerm) {
      router.push(`/report/${searchTerm.toUpperCase()}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && noResults && searchTerm) {
      handleCreateNew();
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      router.push(`/report/${searchResults[0].vehicleId}`);
    } else if (e.key === 'Enter' && searchTerm) {
      router.push(`/report/${searchTerm.toUpperCase()}`);
    }
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSearchTerm(formattedValue);
  };
  
  const handleShowMore = () => {
    setVisibleReportsCount(prevCount => prevCount + INITIAL_VISIBLE_REPORTS);
  };
  
  const visibleReports = useMemo(() => {
      return allReports.slice(0, visibleReportsCount);
  }, [allReports, visibleReportsCount]);

  const renderContent = () => {
    if (isUserLoading) {
      return (
        <Card className="w-full max-w-4xl">
          <CardHeader>
             <Skeleton className="h-8 w-3/4" />
             <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex w-full items-center space-x-2">
               <Skeleton className="h-12 w-full" />
            </div>
            <div className="mt-6 min-h-[150px] border-2 border-dashed rounded-lg flex items-center justify-center">
               <Skeleton className="h-6 w-1/4" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!user) {
      return (
        <Card className="w-full max-w-3xl text-left">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">Welcome to the Valuation Report Generator</CardTitle>
                <CardDescription className="text-lg">
                  A powerful tool to create, manage, and collaborate on vehicle valuation reports.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                        <FileText className="mx-auto h-10 w-10 text-primary" />
                        <h3 className="font-semibold">Dynamic Reports</h3>
                        <p className="text-sm text-muted-foreground">Instantly create new reports or search for existing ones by vehicle ID. Enjoy a live preview as you fill in data.</p>
                    </div>
                    <div className="space-y-2">
                        <Wrench className="mx-auto h-10 w-10 text-primary" />
                        <h3 className="font-semibold">Layout Customization</h3>
                        <p className="text-sm text-muted-foreground">Admins can visually drag, drop, resize, and configure every field on the report, creating perfect, versioned layouts.</p>
                    </div>
                    <div className="space-y-2">
                        <Shield className="mx-auto h-10 w-10 text-primary" />
                        <h3 className="font-semibold">Admin Control</h3>
                        <p className="text-sm text-muted-foreground">A secure admin panel provides a full overview of all reports and access to a detailed save history for auditing.</p>
                    </div>
                </div>

                <div className="text-center pt-4 border-t">
                    <p className="mt-4 text-base text-muted-foreground">
                        Please sign in to access the dashboard and begin.
                    </p>
                </div>
            </CardContent>
        </Card>
      );
    }

    return (
      <div className="w-full max-w-4xl space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                    <CardTitle className="text-2xl">Vehicle Report Database</CardTitle>
                    <CardDescription>
                        Search for an existing report by vehicle registration number or create a new one.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-col sm:flex-row w-full items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="relative flex-grow w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Enter Vehicle Registration No..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            className="pl-10 text-lg w-full"
                        />
                        </div>
                        {noResults && searchTerm && (
                        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create New
                        </Button>
                        )}
                    </div>

                    <div className="mt-6 min-h-[100px]">
                        {isSearching ? (
                        <p className="text-center text-muted-foreground">Searching...</p>
                        ) : searchResults.length > 0 ? (
                        <ul className="space-y-2">
                            {searchResults.map((report) => (
                            <li key={report.id}>
                                <Link href={`/report/${report.vehicleId}`} passHref>
                                <div className="flex items-center p-3 rounded-md border bg-card hover:bg-muted transition-colors cursor-pointer">
                                    <Car className="mr-4 h-5 w-5 text-primary shrink-0" />
                                    <div className='flex-grow overflow-hidden'>
                                        <p className="font-semibold truncate">{report.vehicleId}</p>
                                    </div>
                                </div>
                                </Link>
                            </li>
                            ))}
                        </ul>
                        ) : noResults ? (
                            <div className="text-center p-6 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No reports found for '<span className='font-semibold text-foreground'>{searchTerm}</span>'.</p>
                            <p className="text-sm text-muted-foreground mt-1">You can create a new one now.</p>
                        </div>
                        ) : (
                        !searchTerm && (
                            <div className="text-center p-6 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Enter a vehicle number to begin searching.</p>
                            </div>
                        )
                        )}
                    </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                 <ReportStats reports={allReports} />
            </div>
        </div>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>A list of all reports in the system, sorted by the most recently updated.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingReports ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                     <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : visibleReports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleReports.map(report => (
                        <Card key={report.id}>
                             <CardHeader>
                                <CardTitle className="font-mono text-primary">{report.vehicleId}</CardTitle>
                                <CardDescription>Last Saved By: {report.userName || 'Unknown'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Last Updated: {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleString() : 'N/A'}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Link href={`/admin/history/${report.id}`} passHref>
                                    <Button variant="ghost" size="sm">
                                        <History className="mr-2 h-3 w-3" /> History
                                    </Button>
                                </Link>
                                <Link href={`/report/${report.vehicleId}`} passHref>
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-3 w-3" /> View
                                </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No reports found.</p>
                </div>
              )}
               {allReports.length > visibleReportsCount && (
                <div className="mt-6 text-center">
                    <Button onClick={handleShowMore} variant="secondary">See More</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6">
        {renderContent()}
      </main>
    </div>
  );
}
