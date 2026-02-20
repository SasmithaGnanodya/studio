
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, FileText, Wrench, Shield } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit, onSnapshot, orderBy, or } from 'firebase/firestore';
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
         <Card className="bg-card/50 backdrop-blur-sm">
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

  useEffect(() => {
    if (!user || !firestore || searchTerm.length < 2) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setIsSearching(true);
    const debounceTimeout = setTimeout(async () => {
      const reportsRef = collection(firestore, `reports`);
      const term = searchTerm.toUpperCase();
      
      // Highly sensitive multi-field search for key mandatory identifiers
      const q = query(
        reportsRef,
        or(
          where('vehicleId', '==', term),
          where('engineNumber', '==', term),
          where('chassisNumber', '==', term),
          where('reportNumber', '==', term)
        ),
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
    }, 400);

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm, firestore, user]);

  useEffect(() => {
    if (user && firestore) {
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
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        router.push(`/report/${searchResults[0].vehicleId}`);
      } else if (searchTerm) {
        router.push(`/report/${searchTerm.toUpperCase()}`);
      }
    }
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value.toUpperCase();
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
        <Card className="w-full max-w-4xl bg-card/50 backdrop-blur-sm">
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
        <Card className="w-full max-w-3xl text-left bg-card/50 backdrop-blur-sm border-primary/20 shadow-primary/10 shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary">Welcome to the Valuation Report Generator</CardTitle>
                <CardDescription className="text-lg">
                  A powerful tool to create, manage, and collaborate on vehicle valuation reports.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="space-y-2">
                        <FileText className="mx-auto h-10 w-10 text-accent" />
                        <h3 className="font-semibold">Dynamic Reports</h3>
                        <p className="text-sm text-muted-foreground">Instantly create new reports or search for existing ones by ID. Enjoy a live preview as you fill in data.</p>
                    </div>
                    <div className="space-y-2">
                        <Wrench className="mx-auto h-10 w-10 text-accent" />
                        <h3 className="font-semibold">Interactive Editing</h3>
                        <p className="text-sm text-muted-foreground">Fill out reports directly within the PDF layout. Drag and drop fields in the admin editor for pixel-perfect templates.</p>
                    </div>
                    <div className="space-y-2">
                        <Shield className="mx-auto h-10 w-10 text-accent" />
                        <h3 className="font-semibold">Advanced Search</h3>
                        <p className="text-sm text-muted-foreground">Quickly find reports using Registration Number, Engine Number, Chassis Number, or Report ID.</p>
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
                <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                    <CardTitle className="text-2xl">Vehicle Report Database</CardTitle>
                    <CardDescription>
                        Search by any identifier: Reg No, Engine No, Chassis No, or ID.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex flex-col sm:flex-row w-full items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <div className="relative flex-grow w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Enter Search Criteria..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            className="pl-10 text-lg w-full"
                        />
                        </div>
                        {noResults && searchTerm && (
                        <Button onClick={handleCreateNew} className="w-full sm:w-auto">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            New Report
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
                                        <div className="flex items-center gap-2">
                                          <p className="font-semibold truncate">{report.vehicleId}</p>
                                          {report.reportNumber && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">{report.reportNumber}</span>}
                                        </div>
                                        <div className="flex gap-4 text-[10px] text-muted-foreground truncate">
                                          <span>Eng: {report.engineNumber || 'N/A'}</span>
                                          <span>Chassis: {report.chassisNumber || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                </Link>
                            </li>
                            ))}
                        </ul>
                        ) : noResults ? (
                            <div className="text-center p-6 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">No reports found for '<span className='font-semibold text-foreground'>{searchTerm}</span>'.</p>
                            <p className="text-sm text-muted-foreground mt-1">Start a new valuation for this vehicle.</p>
                        </div>
                        ) : (
                        !searchTerm && (
                            <div className="text-center p-6 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Enter search criteria to begin.</p>
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
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Most recently updated vehicle valuations.</CardDescription>
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
                        <Link key={report.id} href={`/report/${report.vehicleId}`} passHref>
                            <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader className="pb-2">
                                    <CardTitle className="font-mono text-primary text-base flex justify-between items-center">
                                      {report.vehicleId}
                                      {report.reportNumber && <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-sm">{report.reportNumber}</span>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <p className="text-[10px] text-muted-foreground truncate">Eng: {report.engineNumber || 'N/A'}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">Chassis: {report.chassisNumber || 'N/A'}</p>
                                    <p className="text-[9px] text-muted-foreground mt-2 border-t pt-1">
                                        Saved: {report.updatedAt ? new Date(report.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
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
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6">
        {renderContent()}
      </main>
    </div>
  );
}
