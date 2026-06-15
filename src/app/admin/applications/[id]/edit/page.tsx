"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../../../supabase/client";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

const ADMIN_EMAIL = "admin@emeahss.edu";

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

const gradeOptions = ["A+", "A", "B+", "B", "C+", "C", "D+"];

interface CoursePreference {
  preference: number;
  code: string;
  name: string;
}

interface FlatFormData {
  fee_paid: string;
  google_pay_number: string;
  payment_date: string;
  applicant_name: string;
  mobile_number: string;
  whatsapp_number: string;
  qualifying_exam: string;
  register_number: string;
  exam_year: string;
  school_name: string;
  gender: string;
  religion: string;
  date_of_birth: string;
  mother_name: string;
  father_name: string;
  permanent_address: string;
  house_name: string;
  post_office: string;
  taluk: string;
  panchayath_municipality: string;
  exam_type: string;
  application_number: string;
  status: string;

  course_preferences: string[];

  ncc_selected: boolean;
  ncc_type: { ncc: boolean; scouts_guides: boolean; student_police_cadet: boolean };
  dependent_jawans_killed: boolean;
  dependent_jawans_service: boolean;

  sports_state_participation: number | string;
  sports_district: { a_grade: number | string; b_grade: number | string; c_grade: number | string; participation: number | string };

  kalolsavam_state_participation: number | string;
  kalolsavam_district: { a_grade: number | string; b_grade: number | string; c_grade: number | string; participation: number | string };

  national_state_test: boolean;

  co_curricular: {
    state_science_fair: { a: number | string; b: number | string; c: number | string; d: number | string; e: number | string };
    state_social_science_fair: { a: number | string; b: number | string; c: number | string; d: number | string; e: number | string };
    state_maths_fair: { a: number | string; b: number | string; c: number | string; d: number | string; e: number | string };
    state_it_fest: { a: number | string; b: number | string; c: number | string; d: number | string; e: number | string };
    state_work_experience_fair: { a: number | string; b: number | string; c: number | string; d: number | string; e: number | string };
  };

  eligibility: {
    little_kites: boolean;
    jrc: boolean;
    lss: boolean;
    uss: boolean;
    nmms: boolean;
    clubs_count: number | string;
  };

  sslc_grades: {
    english: string; language1: string; language2: string; hindi: string;
    social_science: string; physics: string; chemistry: string; biology: string;
    maths: string; information_technology: string;
  };

  cbse_marks: {
    english: string; language: string; social_science: string; science: string; maths: string;
  };
}

function defaultFlatFormData(): FlatFormData {
  return {
    fee_paid: "", google_pay_number: "", payment_date: "",
    applicant_name: "", mobile_number: "", whatsapp_number: "",
    qualifying_exam: "", register_number: "", exam_year: "", school_name: "",
    gender: "", religion: "", date_of_birth: "",
    mother_name: "", father_name: "",
    permanent_address: "", house_name: "", post_office: "", taluk: "", panchayath_municipality: "",
    exam_type: "sslc", application_number: "", status: "pending",
    course_preferences: ["", "", ""],
    ncc_selected: false,
    ncc_type: { ncc: false, scouts_guides: false, student_police_cadet: false },
    dependent_jawans_killed: false, dependent_jawans_service: false,
    sports_state_participation: 0,
    sports_district: { a_grade: 0, b_grade: 0, c_grade: 0, participation: 0 },
    kalolsavam_state_participation: 0,
    kalolsavam_district: { a_grade: 0, b_grade: 0, c_grade: 0, participation: 0 },
    national_state_test: false,
    co_curricular: {
      state_science_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
      state_social_science_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
      state_maths_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
      state_it_fest: { a: 0, b: 0, c: 0, d: 0, e: 0 },
      state_work_experience_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
    },
    eligibility: { little_kites: false, jrc: false, lss: false, uss: false, nmms: false, clubs_count: 0 },
    sslc_grades: {
      english: "", language1: "", language2: "", hindi: "", social_science: "",
      physics: "", chemistry: "", biology: "", maths: "", information_technology: "",
    },
    cbse_marks: {
      english: "", language: "", social_science: "", science: "", maths: "",
    },
  };
}

export default function EditApplicationPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<FlatFormData>(defaultFlatFormData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.replace("/admin/login");
        return;
      }
      const res = await fetch(`/api/applications/${params.id}`);
      if (!res.ok) {
        setError("Failed to load application");
        setLoading(false);
        return;
      }
      const data = await res.json();
      initializeForm(data);
      setLoading(false);
    }
    init();
  }, [params.id]);

  function initializeForm(data: any) {
    const bp = data.bonus_points || {};
    const sp = data.sports_participation || {};
    const kp = data.kalolsavam_participation || {};
    const cc = data.co_curricular_activities || {};
    const el = data.eligibility || {};

    setFormData({
      fee_paid: data.fee_paid?.toString() || "",
      google_pay_number: data.google_pay_number || "",
      payment_date: data.payment_date || "",
      applicant_name: data.applicant_name || "",
      mobile_number: data.mobile_number || "",
      whatsapp_number: data.whatsapp_number || "",
      qualifying_exam: data.qualifying_exam || "",
      register_number: data.register_number || "",
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
      exam_type: data.exam_type || "sslc",
      application_number: data.application_number?.toString() || "",
      status: data.status || "pending",
      course_preferences: (data.course_preferences || []).map((p: CoursePreference) => p.code),
      ncc_selected: bp.ncc || false,
      ncc_type: bp.ncc_type || { ncc: false, scouts_guides: false, student_police_cadet: false },
      dependent_jawans_killed: bp.dependent_jawans_killed || false,
      dependent_jawans_service: bp.dependent_jawans_service || false,
      sports_state_participation: sp.state_level || 0,
      sports_district: sp.district_level || { a_grade: 0, b_grade: 0, c_grade: 0, participation: 0 },
      kalolsavam_state_participation: kp.state_level || 0,
      kalolsavam_district: kp.district_level || { a_grade: 0, b_grade: 0, c_grade: 0, participation: 0 },
      national_state_test: data.national_state_test || false,
      co_curricular: {
        state_science_fair: cc.state_science_fair || { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_social_science_fair: cc.state_social_science_fair || { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_maths_fair: cc.state_maths_fair || { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_it_fest: cc.state_it_fest || { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_work_experience_fair: cc.state_work_experience_fair || { a: 0, b: 0, c: 0, d: 0, e: 0 },
      },
      eligibility: {
        little_kites: el.little_kites || false,
        jrc: el.jrc || false,
        lss: el.lss || false,
        uss: el.uss || false,
        nmms: el.nmms || false,
        clubs_count: el.clubs_count ?? 0,
      },
      sslc_grades: data.subject_grades || {
        english: "", language1: "", language2: "", hindi: "", social_science: "",
        physics: "", chemistry: "", biology: "", maths: "", information_technology: "",
      },
      cbse_marks: data.cbse_marks || {
        english: "", language: "", social_science: "", science: "", maths: "",
      },
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "register_number") {
      setFormData((prev) => ({ ...prev, register_number: value.replace(/[^0-9]/g, "").slice(0, 8) }));
    } else if (name === "applicant_name") {
      setFormData((prev) => ({ ...prev, applicant_name: value.toUpperCase() }));
    } else if (name === "eligibility.clubs_count") {
      setFormData((prev) => ({
        ...prev,
        eligibility: { ...prev.eligibility, clubs_count: value === "" ? "" : parseInt(value) },
      }));
    } else if (name.startsWith("sports_district.")) {
      const gradeType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        sports_district: { ...prev.sports_district, [gradeType]: value === "" ? "" : parseInt(value) },
      }));
    } else if (name.startsWith("kalolsavam_district.")) {
      const gradeType = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        kalolsavam_district: { ...prev.kalolsavam_district, [gradeType]: value === "" ? "" : parseInt(value) },
      }));
    } else if (name.startsWith("co_curricular.")) {
      const parts = name.split(".");
      const fair = parts[1] as keyof FlatFormData["co_curricular"];
      const grade = parts[2] as string;
      setFormData((prev) => ({
        ...prev,
        co_curricular: {
          ...prev.co_curricular,
          [fair]: { ...prev.co_curricular[fair], [grade]: value === "" ? "" : parseInt(value) },
        },
      }));
    } else if (name === "sports_state_participation" || name === "kalolsavam_state_participation") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? "" : parseInt(value) }));
    } else if (type === "checkbox") {
      if (name.startsWith("ncc_type.")) {
        const nccType = name.split(".")[1] as keyof FlatFormData["ncc_type"];
        setFormData((prev) => ({ ...prev, ncc_type: { ...prev.ncc_type, [nccType]: checked } }));
      } else if (name.startsWith("eligibility.")) {
        const elType = name.split(".")[1] as keyof FlatFormData["eligibility"];
        setFormData((prev) => ({ ...prev, eligibility: { ...prev.eligibility, [elType]: checked } }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: checked }));
      }
    } else if (name.startsWith("sslc_grades.")) {
      const subject = name.split(".")[1] as keyof FlatFormData["sslc_grades"];
      setFormData((prev) => ({ ...prev, sslc_grades: { ...prev.sslc_grades, [subject]: value } }));
    } else if (name.startsWith("cbse_marks.")) {
      const subject = name.split(".")[1] as keyof FlatFormData["cbse_marks"];
      setFormData((prev) => ({ ...prev, cbse_marks: { ...prev.cbse_marks, [subject]: value } }));
    } else if (name.startsWith("course_preferences")) {
      const index = parseInt(name.split("[")[1]);
      setFormData((prev) => {
        const newPrefs = [...prev.course_preferences];
        newPrefs[index] = value;
        return { ...prev, course_preferences: newPrefs };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const sp = formData.sports_state_participation;
    const kp = formData.kalolsavam_state_participation;

    const payload = {
      fee_paid: parseFloat(formData.fee_paid) || 0,
      google_pay_number: formData.google_pay_number,
      payment_date: formData.payment_date,
      applicant_name: formData.applicant_name,
      mobile_number: formData.mobile_number,
      whatsapp_number: formData.whatsapp_number,
      qualifying_exam: formData.qualifying_exam,
      register_number: formData.register_number,
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
      application_number: formData.application_number ? parseInt(formData.application_number) : null,
      status: formData.status,
      course_preferences: formData.course_preferences
        .map((code, index) => {
          const c = courseOptions.find((co) => co.code === code);
          return { preference: index + 1, code, name: c ? c.name : "" };
        })
        .filter((p) => p.code),
      subject_grades: formData.exam_type === "sslc" ? formData.sslc_grades : formData.cbse_marks,
      cbse_marks: formData.exam_type === "cbse" ? formData.cbse_marks : null,
      bonus_points: {
        ncc: formData.ncc_selected,
        ncc_type: formData.ncc_type,
        dependent_jawans_killed: formData.dependent_jawans_killed,
        dependent_jawans_service: formData.dependent_jawans_service,
      },
      sports_participation: {
        state_level: parseInt((typeof sp === "string" ? sp : sp.toString())) || 0,
        district_level: Object.fromEntries(
          Object.entries(formData.sports_district).map(([k, v]) => [k, v === "" ? 0 : v]),
        ),
      },
      kalolsavam_participation: {
        state_level: parseInt((typeof kp === "string" ? kp : kp.toString())) || 0,
        district_level: Object.fromEntries(
          Object.entries(formData.kalolsavam_district).map(([k, v]) => [k, v === "" ? 0 : v]),
        ),
      },
      co_curricular_activities: Object.fromEntries(
        Object.entries(formData.co_curricular).map(([fair, grades]) => [
          fair,
          Object.fromEntries(
            Object.entries(grades as Record<string, any>).map(([g, v]) => [g, v === "" ? 0 : v]),
          ),
        ]),
      ),
      eligibility: {
        ...formData.eligibility,
        clubs_count:
          formData.eligibility.clubs_count === "" || formData.eligibility.clubs_count === undefined
            ? 0
            : Number(formData.eligibility.clubs_count),
      },
      national_state_test: formData.national_state_test,
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
      router.push("/admin");
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

  if (error && !formData.applicant_name) {
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

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

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
              Editing: {formData.applicant_name || formData.register_number}
            </div>
          </div>

          {success && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
              Application updated successfully! Redirecting to admin dashboard...
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
                      <label className={labelClass}>Fee Paid</label>
                      <input type="number" name="fee_paid" value={formData.fee_paid} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Google Pay Number</label>
                      <input type="text" name="google_pay_number" value={formData.google_pay_number} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Payment Date</label>
                      <input type="date" name="payment_date" value={formData.payment_date} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </section>

                {/* Personal Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Application Number</label>
                      <input type="number" name="application_number" value={formData.application_number} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Applicant Name</label>
                      <input type="text" name="applicant_name" value={formData.applicant_name} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Register Number</label>
                      <input type="text" name="register_number" value={formData.register_number} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile Number</label>
                      <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>WhatsApp Number</label>
                      <input type="tel" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Qualifying Exam</label>
                      <select name="qualifying_exam" value={formData.qualifying_exam} onChange={handleChange} className={inputClass}>
                        <option value="">Select</option>
                        <option value="sslc">SSLC</option>
                        <option value="cbse">CBSE</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Exam Year</label>
                      <select name="exam_year" value={formData.exam_year} onChange={handleChange} className={inputClass}>
                        <option value="">Select Year</option>
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>School Name</label>
                      <input type="text" name="school_name" value={formData.school_name} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Gender</label>
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
                      <label className={labelClass}>Religion</label>
                      <select name="religion" value={formData.religion} onChange={handleChange} className={inputClass}>
                        <option value="">Select Religion</option>
                        <option value="Islam">Islam</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className={inputClass} required />
                    </div>
                  </div>
                </section>

                {/* Parent Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Parent Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Mother's Name</label>
                      <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Father's Name</label>
                      <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} className={inputClass} />
                    </div>
                  </div>
                </section>

                {/* Address Information */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Permanent Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>House Name</label>
                      <input type="text" name="house_name" value={formData.house_name} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Post Office</label>
                      <input type="text" name="post_office" value={formData.post_office} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Taluk</label>
                      <input type="text" name="taluk" value={formData.taluk} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Panchayath/Municipality</label>
                      <input type="text" name="panchayath_municipality" value={formData.panchayath_municipality} onChange={handleChange} className={inputClass} required />
                    </div>
                    <div className="md:col-span-3">
                      <label className={labelClass}>Permanent Address</label>
                      <textarea name="permanent_address" value={formData.permanent_address} onChange={handleChange} rows={3} className={inputClass} required />
                    </div>
                  </div>
                </section>

                {/* Academic & Status */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Exam Type</label>
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
                      <label className={labelClass}>Status</label>
                      <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Subject Grades */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Grades obtained for the qualifying examination</h3>

                  {formData.exam_type === "sslc" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.keys(formData.sslc_grades).map((subject) => (
                        <div key={subject}>
                          <label className={labelClass}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1).replace(/([a-z])(\d)/, "$1 $2")}
                          </label>
                          <select
                            name={`sslc_grades.${subject}`}
                            value={formData.sslc_grades[subject as keyof typeof formData.sslc_grades]}
                            onChange={handleChange}
                            className={inputClass}
                          >
                            <option value="">Select Grade</option>
                            {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.exam_type === "cbse" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.keys(formData.cbse_marks).map((subject) => (
                        <div key={subject}>
                          <label className={labelClass}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                          </label>
                          <input
                            type="number"
                            name={`cbse_marks.${subject}`}
                            value={(formData.cbse_marks as Record<string, string>)[subject]}
                            onChange={handleChange}
                            className={inputClass}
                            min="0" max="100"
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                          name={`course_preferences[${idx}]`}
                          value={formData.course_preferences[idx] || ""}
                          onChange={handleChange}
                          className={inputClass}
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

                {/* Bonus Points */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                    Whether the applicant is eligible for bonus points under the following category
                  </h3>
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center">
                      <input type="checkbox" name="ncc_selected" checked={formData.ncc_selected} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <span className="ml-2 text-sm text-gray-700">NCC Scout & Guides (Student Police Cadet or attached in Part)</span>
                    </label>
                  </div>
                  {formData.ncc_selected && (
                    <div className="ml-6 mb-4 space-y-2">
                      {(["ncc", "scouts_guides", "student_police_cadet"] as const).map((type) => (
                        <label key={type} className="flex items-center">
                          <input type="checkbox" name={`ncc_type.${type}`} checked={formData.ncc_type[type]} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                          <span className="ml-2 text-sm text-gray-700">
                            {type === "scouts_guides" ? "Scouts & Guides" : type === "student_police_cadet" ? "Student Police Cadet" : "NCC"}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center space-x-6 mb-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="dependent_jawans_killed" checked={formData.dependent_jawans_killed} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Dependent of Jawans killed in action</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-6 mb-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="dependent_jawans_service" checked={formData.dependent_jawans_service} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Dependent of Jawans in Service or Ex-Service</span>
                    </label>
                  </div>
                </section>

                {/* Sports Participation */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Participation in Sports</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>State Level Participation (Number of items participated)</label>
                      <input type="number" name="sports_state_participation" value={formData.sports_state_participation} onChange={handleChange} className={inputClass} min="0" />
                    </div>
                  </div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">District Level</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(["a_grade", "b_grade", "c_grade", "participation"] as const).map((g) => (
                      <div key={g}>
                        <label className={labelClass}>{g === "a_grade" ? "A Grade" : g === "b_grade" ? "B Grade" : g === "c_grade" ? "C Grade" : "Participation"}</label>
                        <input type="number" name={`sports_district.${g}`} value={formData.sports_district[g]} onChange={handleChange} className={inputClass} min="0" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Kalolsavam Participation */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">Participation in Kerala School Kalolsavam</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={labelClass}>State Level Participation (Number of items participated)</label>
                      <input type="number" name="kalolsavam_state_participation" value={formData.kalolsavam_state_participation} onChange={handleChange} className={inputClass} min="0" />
                    </div>
                  </div>
                  <h4 className="text-md font-medium text-gray-800 mb-2">District Level</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(["a_grade", "b_grade", "c_grade", "participation"] as const).map((g) => (
                      <div key={g}>
                        <label className={labelClass}>{g === "a_grade" ? "A Grade" : g === "b_grade" ? "B Grade" : g === "c_grade" ? "C Grade" : "Participation"}</label>
                        <input type="number" name={`kalolsavam_district.${g}`} value={formData.kalolsavam_district[g]} onChange={handleChange} className={inputClass} min="0" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* National/State Level Test */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                    Whether qualified in the National/State Level Test for the National Talent Search Examination
                  </h3>
                  <div className="flex items-center space-x-6 mb-4">
                    <label className="flex items-center">
                      <input type="radio" name="national_state_test" checked={formData.national_state_test === true} onChange={() => setFormData((prev) => ({ ...prev, national_state_test: true }))} className="h-4 w-4 text-blue-600 border-gray-300" />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="national_state_test" checked={formData.national_state_test === false} onChange={() => setFormData((prev) => ({ ...prev, national_state_test: false }))} className="h-4 w-4 text-blue-600 border-gray-300" />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                </section>

                {/* Co-curricular Activities */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">
                    (e) Details of participation in co-curricular activities. Write the number of grades won in the relevant boxes.
                  </h3>
                  <div className="grid grid-cols-6 gap-2 mb-2 font-medium text-sm">
                    <div className="col-span-1"></div>
                    <div className="col-span-1">A Grade</div>
                    <div className="col-span-1">B Grade</div>
                    <div className="col-span-1">C Grade</div>
                    <div className="col-span-1">D Grade</div>
                    <div className="col-span-1">E Grade</div>
                  </div>
                  {(["state_science_fair", "state_social_science_fair", "state_maths_fair", "state_it_fest", "state_work_experience_fair"] as const).map((fair) => (
                    <div key={fair} className="grid grid-cols-6 gap-2 mb-2">
                      <div className="col-span-1 pt-2 text-sm">
                        {fair === "state_science_fair" ? "State Science Fair" :
                         fair === "state_social_science_fair" ? "State Social Science Fair" :
                         fair === "state_maths_fair" ? "State Maths Fair" :
                         fair === "state_it_fest" ? "State IT Fest" :
                         "State Work Experience Fair"}
                      </div>
                      {(["a", "b", "c", "d", "e"] as const).map((grade) => (
                        <div key={grade} className="col-span-1">
                          <input
                            type="number"
                            name={`co_curricular.${fair}.${grade}`}
                            value={formData.co_curricular[fair][grade]}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </section>

                {/* Eligibility */}
                <section>
                  <h3 className="text-lg font-medium mb-4 pb-2 border-b">(f) (Tick checkboxes if eligible)</h3>
                  <div className="flex items-center space-x-6 mb-4 flex-wrap gap-y-2">
                    {(["little_kites", "jrc", "lss", "uss", "nmms"] as const).map((item) => (
                      <label key={item} className="flex items-center">
                        <input type="checkbox" name={`eligibility.${item}`} checked={formData.eligibility[item]} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">
                          {item === "little_kites" ? "Little Kites (5 Grade)" : item.toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Number of Clubs</label>
                      <input type="number" name="eligibility.clubs_count" value={formData.eligibility.clubs_count} onChange={handleChange} className={inputClass} min="0" />
                    </div>
                  </div>
                </section>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-4 justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                  )}
                </Button>
                <Link href="/admin">
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
