"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, Bug } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import "@/app/print.css";
import { createClient } from "../../../../supabase/client";

// Helper function to safely get values from sessionStorage with JSON parsing
const getFromSession = (key: string, defaultValue: any = null) => {
  const value = sessionStorage.getItem(key);
  if (!value) return defaultValue;
  
  // Try to parse as JSON if it might be an object/array
  if (value.startsWith('{') || value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      console.error(`Error parsing ${key} from sessionStorage:`, e);
      return value;
    }
  }
  
  return value;
};

// Helper function to check boolean values from session (handles strings "true"/"false")
const getBoolFromSession = (path: string, defaultValue: boolean = false) => {
  // Check if this is a nested path (contains a dot)
  if (path.includes('.')) {
    const parts = path.split('.');
    const mainKey = parts[0];
    const nestedPath = parts.slice(1);
    
    // Get the parent object
    const parentObj = getFromSession(mainKey);
    if (!parentObj || typeof parentObj !== 'object') return defaultValue;
    
    // Navigate through the nested path
    let current = parentObj;
    for (const part of nestedPath) {
      if (current === null || typeof current !== 'object' || !(part in current)) {
        return defaultValue;
      }
      current = current[part];
    }
    
    // Convert to boolean if we reached the value
    if (current === null || current === undefined) return defaultValue;
    if (typeof current === 'boolean') return current;
    if (typeof current === 'string') return current === 'true';
    return Boolean(current);
  }
  
  // Handle simple case (direct key)
  const value = sessionStorage.getItem(path);
  if (value === null) return defaultValue;
  return value === 'true';
};

// Define a simple loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
    <div className="text-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p>Loading page...</p>
    </div>
  </div>
);

function ApplicationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<any>(null);

  useEffect(() => {
    try {
      const submissionToken = sessionStorage.getItem('submissionToken');
      const submissionTimestamp = sessionStorage.getItem('submissionTimestamp');
      const urlToken = searchParams.get('token');
      
      const isValid = validateAccess(submissionToken, submissionTimestamp, urlToken);
      
      if (isValid) {
        setIsAuthorized(true);
        const applicationData = sessionStorage.getItem('applicationData');
        if (applicationData) {
          try {
            setApplication(JSON.parse(applicationData));
          } catch (e) {
            console.error("Error parsing application data", e);
          }
        }
      } else {
        setIsAuthorized(false);
      }
    } catch (e) {
      console.error("Error during authorization check:", e);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const validateAccess = (
    token: string | null, 
    timestamp: string | null, 
    urlToken: string | null
  ): boolean => {
    if (!token || !timestamp || !urlToken) return false;
    if (token !== urlToken) return false;
    const submissionTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    const timeWindow = 10 * 60 * 1000; // 10 minutes in milliseconds
    if (isNaN(submissionTime)) return false;
    return !(currentTime - submissionTime > timeWindow);
  };

  const handlePrint = () => window.print();
  const handleDownloadPdf = () => window.print();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold mb-4">Unauthorized Access</h1>
          <p className="mb-6">This page can only be accessed after submitting an application.</p>
          <div className="flex flex-col space-y-3">
            <Link href="/apply">
              <Button>Go to Application Form</Button>
            </Link>
            
            {/* Only show in development mode */}
            {process.env.NODE_ENV !== 'production' && (
              <Button 
                variant="outline" 
                className="text-xs"
                onClick={() => {
                  // Set session storage for testing
                  const testToken = Math.random().toString(36).substring(2);
                  sessionStorage.setItem('submissionToken', testToken);
                  sessionStorage.setItem('submissionTimestamp', Date.now().toString());
                  window.location.href = `/apply/success?token=${encodeURIComponent(testToken)}`;
                }}
              >
                Enable Dev Test Mode
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <div className="flex gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={handleDownloadPdf}
          >
            <Download className="h-4 w-4" />
            Save as PDF
          </Button>
        </div>
      </div>

      <div id="application-print-content" className="border border-gray-300 p-6 print-container pdf-optimized">
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-xl font-bold print-compact">
            EMEAHSS, KONDOTTY, THURAKKAL P.O.
          </h1>
          <p className="text-sm text-gray-600 mt-1 print-small-font print-compact">
            Contact: e-mail:principalemeahss@gmail.com, Mob:9447362750,
            9446526303, 9961988004
          </p>
          <h2 className="text-lg font-semibold mt-2 print-compact">
            APPLICATION FOR PLUS ONE ADMISSION 2025-26(COMMUNITY QUOTA)
          </h2>
          
          <div className="print:hidden mt-6 mb-2">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Application Submitted Successfully!</span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-4 print-compact">
          <div className="bg-blue-50 p-3 border border-blue-200 rounded-md mb-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800">
                 </p>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Submission Date:</span> {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 border-b">
              <h3 className="font-bold text-sm">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x print:divide-x print:text-xs">
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-2/5">Name:</td>
                      <td className="py-1.5 px-3 font-bold">{application?.applicant_name || getFromSession('applicant_name', "")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Gender:</td>
                      <td className="py-1.5 px-3">{application?.gender || getFromSession('gender', "")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Date of Birth:</td>
                      <td className="py-1.5 px-3">{application?.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : getFromSession('date_of_birth', "")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Religion:</td>
                      <td className="py-1.5 px-3">{application?.religion || getFromSession('religion', "")}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Single Window No:</td>
                      <td className="py-1.5 px-3">{application?.single_window_appln_no || getFromSession('single_window_appln_no', "")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-2/5">Mother's Name:</td>
                      <td className="py-1.5 px-3">{application?.mother_name || getFromSession('mother_name', "")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Father's Name:</td>
                      <td className="py-1.5 px-3">{application?.father_name || getFromSession('father_name', "")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Mobile:</td>
                      <td className="py-1.5 px-3">{application?.mobile_number || getFromSession('mobile_number', "")}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">WhatsApp:</td>
                      <td className="py-1.5 px-3">{application?.whatsapp_number || getFromSession('whatsapp_number', "")}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Fee Paid:</td>
                      <td className="py-1.5 px-3">{application?.fee_paid || getFromSession('fee_paid', "")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-100 px-3 py-2 border-b">
              <h3 className="font-bold text-sm">Address Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x print:divide-x print:text-xs">
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-1/3">House:</td>
                      <td className="py-1.5 px-3">{application?.house_name || getFromSession('house_name', "")}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Address:</td>
                      <td className="py-1.5 px-3">{application?.permanent_address || getFromSession('permanent_address', "")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-1/3">Post Office:</td>
                      <td className="py-1.5 px-3">{application?.post_office || getFromSession('post_office', "")}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Taluk:</td>
                      <td className="py-1.5 px-3">{application?.taluk || getFromSession('taluk', "")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-1/2">Panchayath:</td>
                      <td className="py-1.5 px-3">{application?.panchayath_municipality || getFromSession('panchayath_municipality', "")}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Payment Date:</td>
                      <td className="py-1.5 px-3">{application?.payment_date ? new Date(application.payment_date).toLocaleDateString() : getFromSession('payment_date', "")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2">
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b">
                <h3 className="font-bold text-sm">Academic Information</h3>
              </div>
              <table className="w-full border-collapse text-sm print:text-xs">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50 w-1/3">Qualifying Exam:</td>
                    <td className="py-1 px-3">{application?.qualifying_exam || getFromSession('qualifying_exam', "")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50">Exam Type:</td>
                    <td className="py-1 px-3">{application?.exam_type || getFromSession('exam_type', "")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50">Register Number:</td>
                    <td className="py-1 px-3">{application?.register_number || getFromSession('register_number', "")}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50">School Name:</td>
                    <td className="py-1 px-3">{application?.school_name || getFromSession('school_name', "")}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-3 font-medium bg-gray-50">Exam Year:</td>
                    <td className="py-1 px-3">{application?.exam_year || getFromSession('exam_year', "")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b">
                <h3 className="font-bold text-sm">Course Preferences</h3>
              </div>
              <div className="p-3 text-sm print:text-xs">
                <ol className="list-decimal list-inside pl-1">
                  {application?.course_preferences &&
                    application.course_preferences.map(
                      (pref: any, idx: number) => (
                        <li key={idx} className="mb-1">
                          <span className="font-medium">{pref.code}</span> - {pref.name}
                        </li>
                      ),
                    )}
                  {!application?.course_preferences && (
                    <>
                      {getFromSession('course_preferences[0]', "") && (
                        <li className="mb-1">{getFromSession('course_preferences[0]', "")}</li>
                      )}
                      {getFromSession('course_preferences[1]', "") && (
                        <li className="mb-1">{getFromSession('course_preferences[1]', "")}</li>
                      )}
                      {getFromSession('course_preferences[2]', "") && (
                        <li className="mb-1">{getFromSession('course_preferences[2]', "")}</li>
                      )}
                    </>
                  )}
                </ol>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden print:break-inside-avoid">
            <div className="bg-gray-100 px-3 py-2 border-b">
              <h3 className="font-bold text-sm">Academic Grades</h3>
            </div>
            <div className="p-3">
              {(application?.subject_grades || getFromSession('exam_type') === 'sslc' || getFromSession('exam_type') === 'cbse') && (
                <div>
                  <h4 className="font-medium text-sm print:text-xs mb-2">
                    {(application?.exam_type || getFromSession('exam_type')) === 'sslc' ? 'SSLC Grades' : 'CBSE Marks'}
                  </h4>
                  {application?.exam_type === 'sslc' || getFromSession('exam_type') === 'sslc' ? (
                    <table className="w-full border border-gray-200 text-sm print:text-xs">
                      <tbody>
                        <tr className="bg-gray-50">
                          <th className="p-1 border text-left">English</th>
                          <th className="p-1 border text-left">Language 1</th>
                          <th className="p-1 border text-left">Language 2</th>
                          <th className="p-1 border text-left">Hindi</th>
                          <th className="p-1 border text-left">Social Science</th>
                          <th className="p-1 border text-left">Physics</th>
                        </tr>
                        <tr>
                          <td className="p-1 border">{application?.subject_grades?.english || getFromSession('sslc_grades', {})?.english || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.language1 || getFromSession('sslc_grades', {})?.language1 || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.language2 || getFromSession('sslc_grades', {})?.language2 || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.hindi || getFromSession('sslc_grades', {})?.hindi || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.social_science || getFromSession('sslc_grades', {})?.social_science || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.physics || getFromSession('sslc_grades', {})?.physics || "-"}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <th className="p-1 border text-left">Chemistry</th>
                          <th className="p-1 border text-left">Biology</th>
                          <th className="p-1 border text-left">Maths</th>
                          <th className="p-1 border text-left">IT</th>
                          <th className="p-1 border text-left"></th>
                        </tr>
                        <tr>
                          <td className="p-1 border">{application?.subject_grades?.chemistry || getFromSession('sslc_grades', {})?.chemistry || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.biology || getFromSession('sslc_grades', {})?.biology || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.maths || getFromSession('sslc_grades', {})?.maths || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.information_technology || getFromSession('sslc_grades', {})?.information_technology || "-"}</td>
                          <td className="p-1 border"></td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full border border-gray-200 text-sm print:text-xs">
                      <tbody>
                        <tr className="bg-gray-50">
                          <th className="p-1 border text-left">English</th>
                          <th className="p-1 border text-left">Language</th>
                          <th className="p-1 border text-left">Social Sci</th>
                          <th className="p-1 border text-left">Science</th>
                          <th className="p-1 border text-left">Maths</th>
                        </tr>
                        <tr>
                          <td className="p-1 border">{application?.subject_grades?.english || getFromSession('cbse_marks', {})?.english || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.language || getFromSession('cbse_marks', {})?.language || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.social_science || getFromSession('cbse_marks', {})?.social_science || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.science || getFromSession('cbse_marks', {})?.science || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.maths || getFromSession('cbse_marks', {})?.maths || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pdf-page-break"></div>

          <div className="border rounded-md overflow-hidden print:break-inside-avoid">
            <div className="bg-gray-100 px-3 py-2 border-b">
              <h3 className="font-bold text-sm">Bonus Points & Eligibility</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 p-3 print:p-2 text-sm print:text-xs">
              <div className="border-r print:border-r pr-2">
                <div className="mb-3">
                  <h4 className="font-medium border-b pb-1 mb-2">NCC & Eligibility</h4>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1" width="50%">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('ncc_selected') || application?.bonus_points?.ncc ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>NCC</span>
                          </div>
                        </td>
                        <td className="py-1" width="50%">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('ncc_type.scouts_guides') || application?.bonus_points?.ncc_type?.scouts_guides ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Scouts & Guides</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('ncc_type.student_police_cadet') || application?.bonus_points?.ncc_type?.student_police_cadet ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Student Police Cadet</span>
                          </div>
                        </td>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('eligibility.little_kites') || application?.eligibility?.little_kites ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Little Kites</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('eligibility.jrc') || application?.eligibility?.jrc ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>JRC</span>
                          </div>
                        </td>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('eligibility.nss') || application?.eligibility?.nss ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>NSS</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h4 className="font-medium border-b pb-1 mb-2">Other Status</h4>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('dependent_jawans_killed') || application?.bonus_points?.dependent_jawans_killed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Dependent of Jawans killed in action</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('dependent_jawans_service') || application?.bonus_points?.dependent_jawans_service ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Dependent of Jawans in Service</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${getBoolFromSession('national_state_test') || application?.national_state_test ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>National Talent Search Examination</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Clubs:</span> 
                            <span>{application?.eligibility?.clubs_count || getFromSession('eligibility', {})?.clubs_count || "0"}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Whether qualified in the National/State Level Test for the National Talent Search Examination</span> 
                            <span>{application?.national_state_test || getFromSession('national_state_test') ? "Yes" : "No"}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3 print:gap-1 pl-2">
                <div>
                  <h4 className="font-medium border-b pb-1 mb-2">Sports Participation</h4>
                  <table className="w-full text-xs border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-1 border-b text-left">Level</th>
                        <th className="p-1 border-b text-center w-12">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-1">State Level</td>
                        <td className="p-1 text-center">{application?.sports_participation?.state_level || getFromSession('sports_state_participation', "0")}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-1 font-medium" colSpan={2}>District Level</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">A Grade</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.a_grade || getFromSession('sports_district', {})?.a_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">B Grade</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.b_grade || getFromSession('sports_district', {})?.b_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">C Grade</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.c_grade || getFromSession('sports_district', {})?.c_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">Participation</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.participation || getFromSession('sports_district', {})?.participation || "0"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div>
                  <h4 className="font-medium border-b pb-1 mb-2">Kalolsavam Participation</h4>
                  <table className="w-full text-xs border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-1 border-b text-left">Level</th>
                        <th className="p-1 border-b text-center w-12">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-1">State Level</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.state_level || getFromSession('kalolsavam_state_participation', "0")}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-1 font-medium" colSpan={2}>District Level</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">A Grade</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.a_grade || getFromSession('kalolsavam_district', {})?.a_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">B Grade</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.b_grade || getFromSession('kalolsavam_district', {})?.b_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">C Grade</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.c_grade || getFromSession('kalolsavam_district', {})?.c_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">Participation</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.participation || getFromSession('kalolsavam_district', {})?.participation || "0"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          {(application?.co_curricular || getFromSession('co_curricular')) && (
            <div className="border rounded-md overflow-hidden print:break-inside-avoid">
              <div className="bg-gray-100 px-3 py-2 border-b">
                <h3 className="font-bold text-sm">Co-curricular Activities</h3>
              </div>
              <table className="w-full text-xs border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-1 border-b text-left">Activity</th>
                    <th className="p-1 border-b text-center">A Grade</th>
                    <th className="p-1 border-b text-center">B Grade</th>
                    <th className="p-1 border-b text-center">C Grade</th>
                    <th className="p-1 border-b text-center">D Grade</th>
                    <th className="p-1 border-b text-center">E Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Object.entries(application?.co_curricular || getFromSession('co_curricular', {})).map(([activity, grades]: [string, any]) => (
                    <tr key={activity}>
                      <td className="p-1 capitalize">{activity.replace(/_/g, ' ')}</td>
                      <td className="p-1 text-center">{grades.a || "0"}</td>
                      <td className="p-1 text-center">{grades.b || "0"}</td>
                      <td className="p-1 text-center">{grades.c || "0"}</td>
                      <td className="p-1 text-center">{grades.d || "0"}</td>
                      <td className="p-1 text-center">{grades.e || "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
            margin-header: 0;
            margin-footer: 0;
          }
          head, header, footer, .header, .footer, .print-header {
            display: none !important;
          }
          nav, .navbar, .navigation, .nav {
            display: none !important;
          }
          body {
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
          .print-container {
            padding: 0.5rem !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .space-y-4 > * + * {
            margin-top: 0.35rem !important;
          }
          td, th {
            padding-top: 0.1rem !important;
            padding-bottom: 0.1rem !important;
          }
          h3, h4 {
            font-size: 0.7rem !important;
            margin: 0 !important;
            padding-top: 0.1rem !important;
            padding-bottom: 0.1rem !important;
          }
          p {
            margin: 0 !important;
          }
          .border-rounded-md {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print:break-before-avoid {
            break-before: avoid !important;
          }
          .print:break-after-avoid {
            break-after: avoid !important;
          }
          .grid {
            grid-gap: 0.15rem !important;
          }
          .bg-green-500, .bg-gray-300, .bg-gray-50, .bg-gray-100 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .bg-blue-50 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .inline-block.w-3.h-3 {
            width: 0.5rem !important;
            height: 0.5rem !important;
            min-width: 0.5rem !important;
            min-height: 0.5rem !important;
            display: inline-block !important;
          }
          .overflow-hidden {
            overflow: visible !important;
          }
        }
        @media screen {
          #application-print-content {
            max-width: 100%;
          }
          .grid {
            display: grid !important;
          }
          table {
            border-collapse: collapse;
          }
          table td, table th {
            border: 1px solid #e5e7eb;
          }
          .rounded-md {
            border-radius: 0.375rem;
          }
          .inline-block.w-3.h-3 {
            display: inline-block;
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 9999px;
          }
        }
        .pdf-optimized table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .pdf-optimized td, 
        .pdf-optimized th {
          vertical-align: middle !important;
          height: 24px !important;
          padding: 4px 6px !important;
        }
        .pdf-optimized .border.rounded-md.overflow-hidden {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        .pdf-optimized .grid-cols-2,
        .pdf-optimized .print\\:grid-cols-2 {
          grid-template-columns: 1fr 1fr !important;
        }
        .pdf-optimized .inline-block.w-3.h-3 {
          display: inline-block !important;
          vertical-align: middle !important;
        }
        @media print {
          .pdf-page-break {
            page-break-after: always !important;
            break-after: page !important;
            height: 0 !important;
            display: block !important;
          }
        }
        @media screen {
          .pdf-page-break {
            display: none;
          }
        }
      `}</style>

      <style jsx>{`
        @media print {
          .border-r.print\\:border-r {
            border-right: 1px solid #e5e7eb !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          table th, table td {
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ApplicationSuccessContent />
    </Suspense>
  );
}
