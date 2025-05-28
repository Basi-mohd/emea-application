"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download } from "lucide-react";
import Link from "next/link";
import "@/app/print.css";
import { downloadAsPDF } from "@/app/print-application";

export default function PrintApplication({
  params,
}: {
  params: { id: string };
}) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`/api/applications/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError('Application not found or error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsPdfGenerating(true);
    try {
      await downloadAsPDF('application-print-content', `application-${params.id}.pdf`);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading application data...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="text-center p-8">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error || 'Application not found or error loading data.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <Link
          href={`/admin`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Application
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
            disabled={isPdfGenerating}
          >
            <Download className="h-4 w-4" />
            {isPdfGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div id="application-print-content" className="border border-gray-300 p-6 print-container pdf-optimized">
        <div className="text-center border-b border-gray-200 pb-4">
          <h1 className="text-xl font-bold print-compact">
            EMEAHSS, KONDOTTY, THURAKKAL P.O.
          </h1>
          <p className="text-sm text-gray-600 mt-1 print-small-font print-compact">
            Contact: e-mail:principalemeahss@gmail.com, Phone : 04832714450
          </p>
          <h2 className="text-lg font-semibold mt-2 print-compact">
            APPLICATION FOR PLUS ONE ADMISSION 2025-26(COMMUNITY QUOTA)
          </h2>
        </div>

        <div className="mt-4 space-y-4 print-compact">
          {/* Admin Reference ID */}
          <div className="bg-blue-50 p-3 border border-blue-200 rounded-md mb-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Application Number:</span> {application?.application_number || "N/A"}
              </p>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Submission Date:</span> {application.created_at ? new Date(application.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Personal Information Table with Better UI */}
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
                      <td className="py-1.5 px-3 font-bold">{application.applicant_name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Gender:</td>
                      <td className="py-1.5 px-3">{application.gender}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Date of Birth:</td>
                      <td className="py-1.5 px-3">{application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : ""}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Religion:</td>
                      <td className="py-1.5 px-3">{application.religion}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Register Number:</td>
                      <td className="py-1.5 px-3">{application.register_number}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-2/5">Mother's Name:</td>
                      <td className="py-1.5 px-3">{application.mother_name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Father's Name:</td>
                      <td className="py-1.5 px-3">{application.father_name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Mobile:</td>
                      <td className="py-1.5 px-3">{application.mobile_number}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50">WhatsApp:</td>
                      <td className="py-1.5 px-3">{application.whatsapp_number}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Fee Paid:</td>
                      <td className="py-1.5 px-3">{application.fee_paid}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Address Information */}
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
                      <td className="py-1.5 px-3">{application.house_name}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Address:</td>
                      <td className="py-1.5 px-3">{application.permanent_address}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-1/3">Post Office:</td>
                      <td className="py-1.5 px-3">{application.post_office}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Taluk:</td>
                      <td className="py-1.5 px-3">{application.taluk}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1.5 px-3 font-medium bg-gray-50 w-1/2">Panchayath:</td>
                      <td className="py-1.5 px-3">{application.panchayath_municipality}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium bg-gray-50">Payment Date:</td>
                      <td className="py-1.5 px-3">{application.payment_date ? new Date(application.payment_date).toLocaleDateString() : ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Academic and Course Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 print:gap-2">
            {/* Academic Information */}
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-100 px-3 py-2 border-b">
                <h3 className="font-bold text-sm">Academic Information</h3>
              </div>
              <table className="w-full border-collapse text-sm print:text-xs">
                <tbody>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50 w-1/3">Qualifying Exam:</td>
                    <td className="py-1 px-3">{application.qualifying_exam}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50">Exam Type:</td>
                    <td className="py-1 px-3">{application.exam_type}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50">Register Number:</td>
                    <td className="py-1 px-3">{application.register_number}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-1 px-3 font-medium bg-gray-50">School Name:</td>
                    <td className="py-1 px-3">{application.school_name}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-3 font-medium bg-gray-50">Exam Year:</td>
                    <td className="py-1 px-3">{application.exam_year}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Course Preferences */}
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
                </ol>
              </div>
            </div>
          </div>

          {/* Grades */}
          <div className="border rounded-md overflow-hidden print:break-inside-avoid">
            <div className="bg-gray-100 px-3 py-2 border-b">
              <h3 className="font-bold text-sm">Academic Grades</h3>
            </div>
            <div className="p-3">
              {(application?.subject_grades) && (
                <div>
                  <h4 className="font-medium text-sm print:text-xs mb-2">
                    {application.exam_type === 'sslc' ? 'SSLC Grades' : 'CBSE Marks'}
                  </h4>
                  {application.exam_type === 'sslc' ? (
                    // SSLC Grades - Horizontal layout
                    <table className="w-full border border-gray-200 text-sm print:text-xs">
                      <tbody>
                        <tr className="bg-gray-50">
                          <th className="p-1 border text-left">English</th>
                          <th className="p-1 border text-left">Language 1</th>
                          <th className="p-1 border text-left">Language 2</th>
                          <th className="p-1 border text-left">Hindi</th>
                          <th className="p-1 border text-left">Social Sci</th>
                          <th className="p-1 border text-left">Physics</th>
                        </tr>
                        <tr>
                          <td className="p-1 border">{application?.subject_grades?.english || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.language1 || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.language2 || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.hindi || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.social_science || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.physics || "-"}</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <th className="p-1 border text-left">Chemistry</th>
                          <th className="p-1 border text-left">Biology</th>
                          <th className="p-1 border text-left">Maths</th>
                          <th className="p-1 border text-left">IT</th>
                          <th className="p-1 border text-left"></th>
                        </tr>
                        <tr>
                          <td className="p-1 border">{application?.subject_grades?.chemistry || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.biology || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.maths || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.information_technology || "-"}</td>
                          <td className="p-1 border"></td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    // CBSE Marks - Horizontal layout
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
                          <td className="p-1 border">{application?.subject_grades?.english || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.language || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.social_science || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.science || "-"}</td>
                          <td className="p-1 border">{application?.subject_grades?.maths || "-"}</td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Force page break here for PDF */}
          <div className="pdf-page-break"></div>

          {/* Bonus Points & Eligibility with Status Badges */}
          <div className="border rounded-md overflow-hidden print:break-inside-avoid">
            <div className="bg-gray-100 px-3 py-2 border-b">
              <h3 className="font-bold text-sm">Bonus Points & Eligibility</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 p-3 print:p-2 text-sm print:text-xs">
              {/* Left Column: Eligibility Badges */}
              <div className="border-r print:border-r pr-2">
                <div className="mb-3">
                  <h4 className="font-medium border-b pb-1 mb-2">NCC & Eligibility</h4>
                  <table className="w-full border-collapse">
                    <tbody>
                      <tr>
                        <td className="py-1" width="50%">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.bonus_points?.ncc ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>NCC</span>
                          </div>
                        </td>
                        <td className="py-1" width="50%">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.bonus_points?.ncc_type?.scouts_guides ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Scouts & Guides</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.bonus_points?.ncc_type?.student_police_cadet ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Student Police Cadet</span>
                          </div>
                        </td>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.eligibility?.little_kites ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Little Kites</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.eligibility?.jrc ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>JRC</span>
                          </div>
                        </td>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.eligibility?.nss ? 'bg-green-500' : 'bg-gray-300'}`}></span>
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
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.bonus_points?.dependent_jawans_killed ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Dependent of Jawans killed in action</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.bonus_points?.dependent_jawans_service ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>Dependent of Jawans in Service</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className={`inline-block w-3 h-3 mr-1 rounded-full ${application?.national_state_test ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span>National Talent Search Examination</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Clubs:</span> 
                            <span>{application?.eligibility?.clubs_count || "0"}</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-1">
                          <div className="flex items-center">
                            <span className="font-medium mr-1">Whether qualified in the National/State Level Test for the National Talent Search Examination</span> 
                            <span>{application?.national_state_test ? "Yes" : "No"}</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Right Column: Participation Tables */}
              <div className="grid grid-cols-1 gap-3 print:gap-1 pl-2">
                {/* Sports Participation Table */}
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
                        <td className="p-1 text-center">{application?.sports_participation?.state_level || "0"}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-1 font-medium" colSpan={2}>District Level</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">A Grade</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.a_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">B Grade</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.b_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">C Grade</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.c_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">Participation</td>
                        <td className="p-1 text-center">{application?.sports_participation?.district_level?.participation || "0"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Kalolsavam Participation Table */}
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
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.state_level || "0"}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-1 font-medium" colSpan={2}>District Level</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">A Grade</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.a_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">B Grade</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.b_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">C Grade</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.c_grade || "0"}</td>
                      </tr>
                      <tr>
                        <td className="p-1 pl-3">Participation</td>
                        <td className="p-1 text-center">{application?.kalolsavam_participation?.district_level?.participation || "0"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Co-curricular Activities */}
          {application?.co_curricular_activities && (
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
                  {Object.entries(application.co_curricular_activities).map(([activity, grades]: [string, any]) => (
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

          {/* Admin section */}
          <div className="mt-6 border border-black p-2 print-compact">
            <h3 className="font-bold text-sm">FOR OFFICE USE ONLY</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p>Admission Status: _______________</p>
              </div>
              <div>
                <p>Date: _______________</p>
              </div>
              <div>
                <p>Principal's Signature: _______________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add print-specific styles */}
      <style jsx global>{`
        @media print {
          /* Remove browser default headers and footers */
          @page {
            size: A4;
            margin: 0.5cm;
            /* Hide browser header/footer */
            margin-header: 0;
            margin-footer: 0;
          }
          
          /* Hide all headers/footers */
          head, header, footer, .header, .footer, .print-header {
            display: none !important;
          }
          
          /* Hide navigation elements */
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
          
          /* Fix for table cutoffs in PDF */
          .border-rounded-md {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Ensure better page breaks */
          .print:break-before-avoid {
            break-before: avoid !important;
          }
          
          .print:break-after-avoid {
            break-after: avoid !important;
          }
          
          /* Make tables more compact for print */
          .grid {
            grid-gap: 0.15rem !important;
          }
          
          /* Force background colors to print */
          .bg-green-500, .bg-gray-300, .bg-gray-50, .bg-gray-100 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Keep reference ID and submission date from being separated */
          .bg-blue-50 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Set fixed dimensions for indicator dots */
          .inline-block.w-3.h-3 {
            width: 0.5rem !important;
            height: 0.5rem !important;
            min-width: 0.5rem !important;
            min-height: 0.5rem !important;
            display: inline-block !important;
          }
          
          /* Avoid large blocks of whitespace */
          .overflow-hidden {
            overflow: visible !important;
          }
        }
        
        /* Additional styling for PDF download */
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
        
        /* PDF Optimization specific styles */
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
        
        /* Force page break in PDF */
        @media print {
          .pdf-page-break {
            page-break-after: always !important;
            break-after: page !important;
            height: 0 !important;
            display: block !important;
            margin: 100px 0 !important;
          }
        }
        
        /* Special style for PDF generation */
        @media screen {
          .pdf-page-break {
            display: none;
            margin: 100px 0 !important;
          }
        }
      `}</style>

      {/* Add additional PDF support styles */}
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
