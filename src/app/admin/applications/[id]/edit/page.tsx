"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../../supabase/client";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const ADMIN_EMAIL = "admin@emeahss.edu";

interface CoursePreference {
  preference: number;
  code: string;
  name: string;
}

interface Application {
  id: string;
  created_at: string;
  applicant_name: string;
  register_number: string;
  application_number?: number;
  mobile_number: string;
  whatsapp_number: string;
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
  course_preferences: CoursePreference[];
  subject_grades?: any;
  bonus_points?: any;
  sports_participation?: any;
  kalolsavam_participation?: any;
  national_state_test?: boolean;
  co_curricular_activities?: any;
  eligibility?: any;
  cbse_marks?: any;
  status?: string;
}

const courseOptions = [
  { code: "01", name: "Physics, Chemistry, Biology & Maths" },
  { code: "11", name: "History, Economics, Poli. Sci & Sociology" },
  { code: "35", name: "Journalism, Eng. Lit., Commun. English & Psychology" },
  { code: "37", name: "Busi. Studies, Accountancy, Economics & Statisctics" },
  {
    code: "39",
    name: "Busi. Studies, Accountancy, Economics & Computer Application",
  },
];

export default function EditApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/admin/login");
        return;
      }
      setAuthChecked(true);

      const res = await fetch(`/api/applications/${params.id}`);
      if (!res.ok) {
        setError("Failed to load application");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setApplication(data);
      initializeForm(data);
      setLoading(false);
    }
    init();
  }, [params.id]);

  function initializeForm(data: Application) {
    const initial: Record<string, any> = {
      applicant_name: data.applicant_name || "",
      register_number: data.register_number || "",
      mobile_number: data.mobile_number || "",
      whatsapp_number: data.whatsapp_number || "",
      qualifying_exam: data.qualifying_exam || "",
      exam_year: data.exam_year || "",
      school_name: data.school_name || "",
      gender: data.gender || "",
      religion: data.religion || "",
      date_of_birth: data.date_of_birth || "",
      mother_name: data.mother_name || "",
      father_name: data.father_name || "",
      permanent_address: data.permanent_address || "",
      house_name: data.house_name || "",
      post_office: data.post_office || "",
      taluk: data.taluk || "",
      panchayath_municipality: data.panchayath_municipality || "",
      exam_type: data.exam_type || "",
      fee_paid: data.fee_paid?.toString() || "",
      google_pay_number: data.google_pay_number || "",
      payment_date: data.payment_date || "",
      application_number: data.application_number || "",
      status: data.status || "pending",
      national_state_test: data.national_state_test || false,
      course_preferences: data.course_preferences || [],
      subject_grades: JSON.stringify(data.subject_grades || null, null, 2),
      cbse_marks: JSON.stringify(data.cbse_marks || null, null, 2),
      bonus_points: JSON.stringify(data.bonus_points || null, null, 2),
      sports_participation: JSON.stringify(data.sports_participation || null, null, 2),
      kalolsavam_participation: JSON.stringify(data.kalolsavam_participation || null, null, 2),
      co_curricular_activities: JSON.stringify(data.co_curricular_activities || null, null, 2),
      eligibility: JSON.stringify(data.eligibility || null, null, 2),
    };
    setFormData(initial);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleCoursePrefChange(index: number, value: string) {
    const prefs = [...(formData.course_preferences || [])];
    const course = courseOptions.find((c) => c.code === value);
    if (index >= prefs.length) {
      for (let i = prefs.length; i <= index; i++) {
        prefs.push({ preference: i + 1, code: "", name: "" });
      }
    }
    prefs[index] = {
      preference: index + 1,
      code: value,
      name: course?.name || "",
    };
    setFormData((prev) => ({ ...prev, course_preferences: prefs }));
  }

  function parseJSONField(value: string): any {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload: Record<string, any> = {
      applicant_name: formData.applicant_name,
      register_number: formData.register_number,
      mobile_number: formData.mobile_number,
      whatsapp_number: formData.whatsapp_number,
      qualifying_exam: formData.qualifying_exam,
      exam_year: formData.exam_year,
      school_name: formData.school_name,
      gender: formData.gender,
      religion: formData.religion,
      date_of_birth: formData.date_of_birth,
      mother_name: formData.mother_name,
      father_name: formData.father_name,
      permanent_address: formData.permanent_address,
      house_name: formData.house_name,
      post_office: formData.post_office,
      taluk: formData.taluk,
      panchayath_municipality: formData.panchayath_municipality,
      exam_type: formData.exam_type,
      fee_paid: parseFloat(formData.fee_paid) || 0,
      google_pay_number: formData.google_pay_number,
      payment_date: formData.payment_date,
      application_number: formData.application_number ? parseInt(formData.application_number) : null,
      status: formData.status,
      national_state_test: formData.national_state_test,
      course_preferences: formData.course_preferences?.filter((p: CoursePreference) => p.code) || [],
      subject_grades: parseJSONField(formData.subject_grades),
      cbse_marks: parseJSONField(formData.cbse_marks),
      bonus_points: parseJSONField(formData.bonus_points),
      sports_participation: parseJSONField(formData.sports_participation),
      kalolsavam_participation: parseJSONField(formData.kalolsavam_participation),
      co_curricular_activities: parseJSONField(formData.co_curricular_activities),
      eligibility: parseJSONField(formData.eligibility),
    };

    try {
      const res = await fetch(`/api/admin/applications/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      setSuccess(true);
      setTimeout(() => router.push(`/admin/applications/${params.id}`), 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update application");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <>
        <DashboardNavbar />
        <main className="w-full">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
            <Link href="/admin" className="mt-4 inline-block text-sm underline">Back to dashboard</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Dashboard
            </Link>
            <div className="text-sm text-muted-foreground">
              Application: {application?.application_number || application?.register_number}
            </div>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
              Application updated successfully! Redirecting...
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold">Edit Application</h1>
              </div>

              <div className="p-8 space-y-8">
                {/* Fee Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Fee Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fee Paid</label>
                      <input type="number" name="fee_paid" value={formData.fee_paid} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Google Pay Number</label>
                      <input type="text" name="google_pay_number" value={formData.google_pay_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                      <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </section>

                {/* Personal Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Application Number</label>
                      <input type="number" name="application_number" value={formData.application_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Applicant Name</label>
                      <input type="text" name="applicant_name" value={formData.applicant_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Register Number</label>
                      <input type="text" name="register_number" value={formData.register_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                      <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                      <input type="tel" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Qualifying Exam</label>
                      <select name="qualifying_exam" value={formData.qualifying_exam} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Select</option>
                        <option value="sslc">SSLC</option>
                        <option value="cbse">CBSE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Exam Year</label>
                      <select name="exam_year" value={formData.exam_year} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Select Year</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">School Name</label>
                      <input type="text" name="school_name" value={formData.school_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Gender</label>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center">
                          <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} className="mr-1" /> Male
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} className="mr-1" /> Female
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Religion</label>
                      <select name="religion" value={formData.religion} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="">Select Religion</option>
                        <option value="Islam">Islam</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                  </div>
                </section>

                {/* Parent Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Parent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                      <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                      <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                </section>

                {/* Address Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Permanent Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">House Name</label>
                      <input type="text" name="house_name" value={formData.house_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Post Office</label>
                      <input type="text" name="post_office" value={formData.post_office} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Taluk</label>
                      <input type="text" name="taluk" value={formData.taluk} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Panchayath/Municipality</label>
                      <input type="text" name="panchayath_municipality" value={formData.panchayath_municipality} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
                      <textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500" required />
                    </div>
                  </div>
                </section>

                {/* Academic Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Exam Type</label>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center">
                          <input type="radio" name="exam_type" value="sslc" checked={formData.exam_type === "sslc"} onChange={handleChange} className="mr-1" /> SSLC
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="exam_type" value="cbse" checked={formData.exam_type === "cbse"} onChange={handleChange} className="mr-1" /> CBSE
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Course Preferences */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Course Preferences</h3>
                  <div className="grid grid-cols-6 gap-4 mb-2 font-medium text-sm">
                    <div className="col-span-1">Preference</div>
                    <div className="col-span-5">Course</div>
                  </div>
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-4 mb-2">
                      <div className="col-span-1 pt-2">{idx + 1}</div>
                      <div className="col-span-5">
                        <select
                          value={
                            (formData.course_preferences as CoursePreference[])?.[idx]?.code || ""
                          }
                          onChange={(e) => handleCoursePrefChange(idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Select code/subject</option>
                          {courseOptions.map((course) => (
                            <option key={course.code} value={course.code}>
                              {course.code} - {course.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </section>

                {/* JSON fields */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Additional Data (JSON)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject Grades (SSLC) / CBSE Marks</label>
                      {formData.exam_type === "cbse" ? (
                        <textarea name="cbse_marks" value={formData.cbse_marks} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      ) : (
                        <textarea name="subject_grades" value={formData.subject_grades} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Bonus Points</label>
                      <textarea name="bonus_points" value={formData.bonus_points} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sports Participation</label>
                      <textarea name="sports_participation" value={formData.sports_participation} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Kalolsavam Participation</label>
                      <textarea name="kalolsavam_participation" value={formData.kalolsavam_participation} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Co-curricular Activities</label>
                      <textarea name="co_curricular_activities" value={formData.co_curricular_activities} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Eligibility</label>
                      <textarea name="eligibility" value={formData.eligibility} onChange={handleChange} rows={5} className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input type="checkbox" name="national_state_test" checked={formData.national_state_test} onChange={handleChange} className="mr-2" />
                        <span className="text-sm font-medium text-gray-700">National/State Level Test</span>
                      </label>
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                  )}
                </Button>
                <Link href={`/admin/applications/${params.id}`}>
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
