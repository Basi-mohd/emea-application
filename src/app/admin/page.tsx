"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Download, Printer, Search, FileText } from "lucide-react";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Define application type
interface Application {
  id: string;
  created_at: string;
  applicant_name: string;
  register_number: string;
  mobile_number: string;
  whatsapp_number: string;
  single_window_appln_no: string;
  qualifying_exam: string;
  exam_year: string;
  school_name: string;
  gender: string;
  religion: string;
  date_of_birth: string;
  fee_paid: number;
  google_pay_number: string;
  payment_date: string;
  exam_type: string;
  permanent_address: string;
  house_name: string;
  post_office: string;
  taluk: string;
  panchayath_municipality: string;
  mother_name: string;
  father_name: string;
  course_preferences: Array<{
    preference: number;
    code: string;
    name: string;
  }>;
  [key: string]: any; // For any additional fields
}

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@emeahss.edu";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is logged in and has admin email
  if (!user || user.email !== ADMIN_EMAIL) {
    return redirect("/admin/login");
  }

  // Handle search query
  const searchQuery = searchParams.search?.trim();

  // Fetch applications from the database
  let applicationsQuery = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply search filter if present
  if (searchQuery) {
    applicationsQuery = applicationsQuery.ilike('register_number', `%${searchQuery}%`);
  }

  const { data: applications, error } = await applicationsQuery;

  if (error) {
    console.error("Error fetching applications:", error);
  }

  const totalApplicants = applications?.length || 0;

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
          <header className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="bg-secondary/50 text-sm p-3 px-4 rounded-lg text-muted-foreground flex gap-2 items-center">
              <span>Welcome to the EMEAHSS Admin Panel</span>
            </div>
          </header>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Applicants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalApplicants}</div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Export Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <form action="/api/admin/export-excel" method="post">
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Export to Excel
                    </Button>
                  </form>
                  
                  <form action="/api/admin/export-all-pdfs" method="post">
                    <Button 
                      type="submit" 
                      variant="outline" 
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download All PDFs
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>

          <section className="bg-card rounded-xl p-6 border shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h2 className="font-semibold text-xl">
                Application Submissions
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                {/* Search Box */}
                <form action="/admin" method="get" className="w-full md:w-64">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      name="search"
                      placeholder="Search by register number"
                      className="pl-8"
                      defaultValue={searchQuery || ""}
                    />
                  </div>
                </form>
              </div>
            </div>

            {applications && applications.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted">
                        <th className="p-2 text-left">Register No.</th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Mobile</th>
                        <th className="p-2 text-left">Exam Type</th>
                        <th className="p-2 text-left">Course Preference</th>
                        <th className="p-2 text-left">Submitted On</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr
                          key={app.id}
                          className="border-b border-gray-200 hover:bg-muted/50"
                        >
                          <td className="p-2">{app.register_number}</td>
                          <td className="p-2">{app.applicant_name}</td>
                          <td className="p-2">{app.mobile_number}</td>
                          <td className="p-2">{app.exam_type}</td>
                          <td className="p-2">
                            {app.course_preferences &&
                              app.course_preferences[0]?.code}
                          </td>
                          <td className="p-2">
                            {new Date(app.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={`/admin/applications/${app.id}`}>
                              </Link>
                              <Link
                                href={`/admin/applications/${app.id}/print`}
                                target="_blank"
                              >
                                <Button size="sm" variant="outline">
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery 
                  ? `No applications found matching register number "${searchQuery}".` 
                  : "No applications submitted yet."}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
