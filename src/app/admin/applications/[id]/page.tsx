import { createClient } from "../../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Printer, Download } from "lucide-react";

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@emeahss.edu";

export default async function ApplicationDetail({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if user is logged in and has admin email
  if (!user || user.email !== ADMIN_EMAIL) {
    return redirect("/admin/login");
  }

  // Fetch application details
  const { data: application, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !application) {
    return (
      <>
        <DashboardNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            Application not found or error loading data.
          </div>
        </div>
      </>
    );
  }

  return (
    <>

      <main className="w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
            <div className="flex gap-2">
              <Link
                href={`/admin/applications/${params.id}/print`}
                target="_blank"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 text-center border-b border-gray-200">
              <h1 className="text-xl font-bold">
                EMEAHSS, KONDOTTY, THURAKKAL P.O.
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Contact: e-mail:principalemeahss@gmail.com, Mob:9447362750,
                9446526303, 9961988004
              </p>
              <h2 className="text-lg font-semibold mt-4">
                APPLICATION FOR PLUS ONE ADMISSION 2025-26(COMMUNITY QUOTA)
              </h2>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {/* Personal Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="font-medium">Fee Paid:</div>
                    <div className="md:col-span-2">{application.fee_paid}</div>

                    <div className="font-medium">Google Pay Number:</div>
                    <div className="md:col-span-2">
                      {application.google_pay_number}
                    </div>

                    <div className="font-medium">Payment Date:</div>
                    <div className="md:col-span-2">
                      {new Date(application.payment_date).toLocaleDateString()}
                    </div>

                    <div className="font-medium">Name of Applicant:</div>
                    <div className="md:col-span-2">
                      {application.applicant_name}
                    </div>

                    <div className="font-medium">Application Number:</div>
                    <div className="md:col-span-2">
                      {application.application_number || "N/A"}
                    </div>

                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-600">Register Number:</span>
                      <span>{application.register_number}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="font-medium text-gray-600">Mobile Number:</span>
                      <span>{application.mobile_number}</span>
                    </div>

                    <div className="font-medium">WhatsApp Number:</div>
                    <div className="md:col-span-2">
                      {application.whatsapp_number}
                    </div>

                    <div className="font-medium">Qualifying Examination:</div>
                    <div className="md:col-span-2">
                      {application.qualifying_exam}
                    </div>

                    <div className="font-medium">Register Number:</div>
                    <div className="md:col-span-2">
                      {application.register_number}
                    </div>

                    <div className="font-medium">Year:</div>
                    <div className="md:col-span-2">{application.exam_year}</div>

                    <div className="font-medium">School:</div>
                    <div className="md:col-span-2">
                      {application.school_name}
                    </div>

                    <div className="font-medium">Gender:</div>
                    <div className="md:col-span-2">{application.gender}</div>

                    <div className="font-medium">Religion:</div>
                    <div className="md:col-span-2">{application.religion}</div>

                    <div className="font-medium">Date of Birth:</div>
                    <div className="md:col-span-2">
                      {new Date(application.date_of_birth).toLocaleDateString()}
                    </div>
                  </div>
                </section>

                {/* Parent Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4">
                    Parent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="font-medium">Mother's Name:</div>
                    <div className="md:col-span-2">
                      {application.mother_name}
                    </div>

                    <div className="font-medium">Father's Name:</div>
                    <div className="md:col-span-2">
                      {application.father_name}
                    </div>
                  </div>
                </section>

                {/* Address Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4">
                    Permanent Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="font-medium">Address:</div>
                    <div className="md:col-span-2">
                      {application.permanent_address}
                    </div>

                    <div className="font-medium">House Name:</div>
                    <div className="md:col-span-2">
                      {application.house_name}
                    </div>

                    <div className="font-medium">Post Office:</div>
                    <div className="md:col-span-2">
                      {application.post_office}
                    </div>

                    <div className="font-medium">Taluk:</div>
                    <div className="md:col-span-2">{application.taluk}</div>

                    <div className="font-medium">Panchayath/Municipality:</div>
                    <div className="md:col-span-2">
                      {application.panchayath_municipality}
                    </div>
                  </div>
                </section>

                {/* Academic Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4">
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="font-medium">Exam Type:</div>
                    <div className="md:col-span-2">{application.exam_type}</div>

                    {application.subject_grades && (
                      <>
                        <div className="font-medium">Subject Grades:</div>
                        <div className="md:col-span-2">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(
                              application.subject_grades,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </>
                    )}

                    <div className="font-medium">Course Preferences:</div>
                    <div className="md:col-span-2">
                      <ol className="list-decimal list-inside">
                        {application.course_preferences &&
                          application.course_preferences.map(
                            (pref: any, idx: number) => (
                              <li key={idx}>
                                {pref.code} - {pref.name}
                              </li>
                            ),
                          )}
                      </ol>
                    </div>
                  </div>
                </section>

                {/* Additional Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {application.bonus_points && (
                      <>
                        <div className="font-medium">Bonus Points:</div>
                        <div className="md:col-span-2">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(application.bonus_points, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}

                    {application.sports_participation && (
                      <>
                        <div className="font-medium">Sports Participation:</div>
                        <div className="md:col-span-2">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(
                              application.sports_participation,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </>
                    )}

                    {application.kalolsavam_participation && (
                      <>
                        <div className="font-medium">
                          Kalolsavam Participation:
                        </div>
                        <div className="md:col-span-2">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(
                              application.kalolsavam_participation,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </>
                    )}

                    <div className="font-medium">
                      National/State Level Test:
                    </div>
                    <div className="md:col-span-2">
                      {application.national_state_test ? "Yes" : "No"}
                    </div>

                    {application.co_curricular_activities && (
                      <>
                        <div className="font-medium">
                          Co-curricular Activities:
                        </div>
                        <div className="md:col-span-2">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(
                              application.co_curricular_activities,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      </>
                    )}

                    {application.eligibility && (
                      <>
                        <div className="font-medium">Eligibility:</div>
                        <div className="md:col-span-2">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(application.eligibility, null, 2)}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
