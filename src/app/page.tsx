
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search, PlusCircle, Car, LogIn } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { Report } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Report[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();

  useEffect(() => {
    if (!user || !firestore || searchTerm.length < 3) {
      setSearchResults([]);
      setNoResults(false);
      return;
    }

    setIsSearching(true);
    const debounceTimeout = setTimeout(async () => {
      const reportsRef = collection(firestore, `reports`);
      const q = query(
        reportsRef,
        where('userId', '==', user.uid),
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

  const handleCreateNew = () => {
    if (searchTerm) {
      router.push(`/report/${searchTerm.toUpperCase()}`);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && noResults && searchTerm) {
      handleCreateNew();
    }
  }
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setSearchTerm(formattedValue);
  };

  const renderContent = () => {
    if (isUserLoading) {
      return (
        <Card className="w-full max-w-2xl">
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
        <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <CardTitle className="text-2xl">Welcome!</CardTitle>
                <CardDescription>
                Please sign in to manage your vehicle reports.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LogIn className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                    Sign in using the button in the top-right corner to get started.
                </p>
            </CardContent>
        </Card>
      );
    }

    return (
        <Card className="w-full max-w-2xl">
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
                    placeholder="Enter Vehicle Registration No"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    className="pl-10 text-lg w-full"
                />
                </div>
                {noResults && searchTerm && (
                <Button onClick={handleCreateNew} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Report
                </Button>
                )}
            </div>

            <div className="mt-6 min-h-[150px]">
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
                                <p className="text-sm text-muted-foreground truncate">
                                    {report.reportData?.manufacturer} {report.reportData?.model} ({report.reportData?.manufactureYear})
                                </p>
                            </div>
                            {report.updatedAt && (
                                <p className='text-sm text-muted-foreground text-right shrink-0 ml-2'>
                                    <span className='hidden sm:inline'>Last updated: </span>
                                    {new Date(report.updatedAt.seconds * 1000).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        </Link>
                    </li>
                    ))}
                </ul>
                ) : noResults ? (
                    <div className="text-center p-6 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No reports found for '<span className='font-semibold text-foreground'>{searchTerm}</span>'.</p>
                    <p className="text-sm text-muted-foreground mt-1">You can create a new one.</p>
                </div>
                ) : (
                <div className="text-center p-6 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">Enter a vehicle number to begin.</p>
                </div>
                )}
            </div>
            </CardContent>
        </Card>
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

    