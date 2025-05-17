"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";
import ClientNavbar from "@/components/client-navbar";
import ClientFooter from "@/components/client-footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define proper types for form data
interface FormData {
  fee_paid: string;
  google_pay_number: string;
  payment_date: string;
  applicant_name: string;
  mobile_number: string;
  whatsapp_number: string;
  single_window_appln_no: string;
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
  course_preferences: string[];
  ncc_selected: boolean;
  ncc_type: {
    ncc: boolean;
    scouts_guides: boolean;
    student_police_cadet: boolean;
  };
  dependent_jawans_killed: boolean;
  dependent_jawans_service: boolean;
  sports_state_participation: number | string;
  sports_district: {
    a_grade: number;
    b_grade: number;
    c_grade: number;
    participation: number;
  };
  kalolsavam_state_participation: number | string;
  kalolsavam_district: {
    a_grade: number;
    b_grade: number;
    c_grade: number;
    participation: number;
  };
  national_state_test: boolean;
  co_curricular: {
    state_science_fair: { a: number; b: number; c: number; d: number; e: number };
    state_social_science_fair: { a: number; b: number; c: number; d: number; e: number };
    state_maths_fair: { a: number; b: number; c: number; d: number; e: number };
    state_it_fest: { a: number; b: number; c: number; d: number; e: number };
    state_work_experience_fair: { a: number; b: number; c: number; d: number; e: number };
  };
  eligibility: {
    little_kites: boolean;
    jrc: boolean;
    nss: boolean;
    clubs_count: number;
  };
  declaration: boolean;
  sslc_grades: {
    english: string;
    language1: string;
    language2: string;
    hindi: string;
    social_science: string;
    physics: string;
    chemistry: string;
    biology: string;
    maths: string;
    information_technology: string;
  };
  cbse_marks: {
    english: string;
    language: string;
    social_science: string;
    science: string;
    maths: string;
  };
}

interface CourseOption {
  code: string;
  name: string;
}

export default function ApplyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [registerNumberError, setRegisterNumberError] = useState<string | null>(null);
  const [isCheckingRegisterNumber, setIsCheckingRegisterNumber] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Function to generate test data for form
  const getTestData = (): FormData => {
    return {
      fee_paid: "",
      google_pay_number: "",
      payment_date: "",
      applicant_name: "",
      mobile_number: "",
      whatsapp_number: "",
      single_window_appln_no: "",
      qualifying_exam: "",
      register_number: "",
      exam_year: "",
      school_name: "",
      gender: "", // Or a default like 'male' or 'female' if one should be pre-selected
      religion: "",
      date_of_birth: "",
      mother_name: "",
      father_name: "",
      permanent_address: "",
      house_name: "",
      post_office: "",
      taluk: "",
      panchayath_municipality: "",
      exam_type: "sslc", // Default to sslc or cbse, or "" if no default
      course_preferences: ["", "", ""], // Keep structure for 3 preferences
      ncc_selected: false,
      ncc_type: {
        ncc: false,
        scouts_guides: false,
        student_police_cadet: false,
      },
      dependent_jawans_killed: false,
      dependent_jawans_service: false,
      sports_state_participation: "", // Or 0 if number preferred and input handles it
      sports_district: {
        a_grade: 0,
        b_grade: 0,
        c_grade: 0,
        participation: 0,
      },
      kalolsavam_state_participation: "", // Or 0
      kalolsavam_district: {
        a_grade: 0,
        b_grade: 0,
        c_grade: 0,
        participation: 0,
      },
      national_state_test: false,
      co_curricular: {
        state_science_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_social_science_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_maths_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_it_fest: { a: 0, b: 0, c: 0, d: 0, e: 0 },
        state_work_experience_fair: { a: 0, b: 0, c: 0, d: 0, e: 0 },
      },
      eligibility: {
        little_kites: false,
        jrc: false,
        nss: false,
        clubs_count: 0,
      },
      declaration: false,
      sslc_grades: {
        english: "",
        language1: "",
        language2: "",
        hindi: "",
        social_science: "",
        physics: "",
        chemistry: "",
        biology: "",
        maths: "",
        information_technology: "",
      },
      cbse_marks: {
        english: "",
        language: "",
        social_science: "",
        science: "",
        maths: "",
      },
    };
  };
  
  // Initialize form with test data
  const [formData, setFormData] = useState<FormData>(getTestData());

  // Course options
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

  // Debounce function to avoid too many database calls
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Check if register number is unique
  const checkRegisterNumberUnique = async (registerNumber: string) => {
    if (!registerNumber) {
      setRegisterNumberError(null);
      return;
    }
    
    // Normalize register number (trim, convert to uppercase)
    const normalizedRegNumber = registerNumber.trim().toUpperCase();
    
    if (!normalizedRegNumber) {
      setRegisterNumberError(null);
      return;
    }
    
    setIsCheckingRegisterNumber(true);
    console.log("Checking register number:", normalizedRegNumber);
    
    try {
      // Use ilike for case-insensitive comparison
      const { data, error } = await supabase
        .from('applications')
        .select('register_number')
        .ilike('register_number', normalizedRegNumber);
      
      console.log("Supabase response:", { data, error });
      
      if (error) {
        console.error('Error checking register number:', error);
        setRegisterNumberError('Error checking register number. Please try again.');
      } else if (data && data.length > 0) {
        console.log("Register number already exists");
        setRegisterNumberError('This register number is already in use.');
      } else {
        console.log("Register number is unique");
        setRegisterNumberError(null);
      }
    } catch (error) {
      console.error('Exception checking register number:', error);
      setRegisterNumberError('Error checking register number. Please try again.');
    } finally {
      setIsCheckingRegisterNumber(false);
    }
  };

  // Debounced version of the check function - increase delay for better UX
  const debouncedCheckRegisterNumber = debounce(checkRegisterNumberUnique, 800);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'register_number') {
      // When register number changes, update the form data and trigger validation
      setFormData({
        ...formData,
        [name]: value,
      });
      // Only validate if there's actual content
      if (value.trim()) {
        console.log("Register number changed, triggering validation");
        debouncedCheckRegisterNumber(value);
      } else {
        setRegisterNumberError(null);
      }
    } else if (type === "checkbox") {
      if (name.startsWith("ncc_type.")) {
        const nccType = name.split(".")[1];
        setFormData({
          ...formData,
          ncc_type: {
            ...formData.ncc_type,
            [nccType]: checked,
          },
        });
      } else if (name.startsWith("eligibility.")) {
        const eligibilityType = name.split(".")[1];
        setFormData({
          ...formData,
          eligibility: {
            ...formData.eligibility,
            [eligibilityType]: checked,
          },
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked,
        });
      }
    } else if (name.startsWith("sslc_grades.")) {
      const subject = name.split(".")[1];
      setFormData({
        ...formData,
        sslc_grades: {
          ...formData.sslc_grades,
          [subject]: value,
        },
      });
    } else if (name.startsWith("cbse_marks.")) {
      const subject = name.split(".")[1];
      setFormData({
        ...formData,
        cbse_marks: {
          ...formData.cbse_marks,
          [subject]: value,
        },
      });
    } else if (name.startsWith("sports_district.")) {
      const gradeType = name.split(".")[1];
      setFormData({
        ...formData,
        sports_district: {
          ...formData.sports_district,
          [gradeType]: parseInt(value) || 0,
        },
      });
    } else if (name.startsWith("kalolsavam_district.")) {
      const gradeType = name.split(".")[1];
      setFormData({
        ...formData,
        kalolsavam_district: {
          ...formData.kalolsavam_district,
          [gradeType]: parseInt(value) || 0,
        },
      });
    } else if (name.startsWith("co_curricular.")) {
      const parts = name.split(".");
      const fair = parts[1] as keyof typeof formData.co_curricular;
      const grade = parts[2] as keyof typeof formData.co_curricular[typeof fair];
      
      setFormData({
        ...formData,
        co_curricular: {
          ...formData.co_curricular,
          [fair]: {
            ...formData.co_curricular[fair],
            [grade]: parseInt(value) || 0,
          },
        },
      });
    } else if (name.startsWith("course_preferences")) {
      const index = parseInt(name.split("[")[1]);
      const newPreferences = [...formData.course_preferences];
      newPreferences[index] = value;
      setFormData({
        ...formData,
        course_preferences: newPreferences,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check register number immediately before submitting
    if (formData.register_number.trim()) {
      await checkRegisterNumberUnique(formData.register_number);
    }
    
    // Don't submit if register number is not unique or if check is in progress
    if (isCheckingRegisterNumber) {
      alert("Please wait, we're verifying your register number.");
      return;
    }
    
    // Don't submit if register number is not unique
    if (registerNumberError) {
      alert("Please fix the register number error before submitting.");
      return;
    }
    
    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  // Function to handle the actual submission after confirmation
  const handleConfirmedSubmit = async () => {
    setLoading(true);

    try {
      // Format the data for submission
      const { declaration, ...dataWithoutDeclaration } = formData;
      
      // Format the data for submission
      const submissionData = {
        // Basic information fields (keep from rest)
        fee_paid: parseFloat(formData.fee_paid) || 0,
        google_pay_number: formData.google_pay_number,
        payment_date: formData.payment_date,
        applicant_name: formData.applicant_name,
        mobile_number: formData.mobile_number,
        whatsapp_number: formData.whatsapp_number,
        single_window_appln_no: formData.single_window_appln_no,
        qualifying_exam: formData.qualifying_exam,
        register_number: formData.register_number,
        exam_year: formData.exam_year,
        school_name: formData.school_name,
        gender: formData.gender,
        religion: formData.religion,
        date_of_birth: formData.date_of_birth,
        mother_name: formData.mother_name,
        father_name: formData.father_name,
        
        // Address fields
        permanent_address: formData.permanent_address,
        house_name: formData.house_name,
        post_office: formData.post_office,
        taluk: formData.taluk,
        panchayath_municipality: formData.panchayath_municipality,
        
        // Exam type
        exam_type: formData.exam_type,
        
        // Transformed/structured fields
        course_preferences: formData.course_preferences
          .map((pref, index) => {
            const selectedCourse = courseOptions.find(
              (course) => course.code === pref,
            );
            return {
              preference: index + 1,
              code: pref,
              name: selectedCourse ? selectedCourse.name : "",
            };
          })
          .filter((pref) => pref.code),
        
        subject_grades:
          formData.exam_type === "sslc"
            ? formData.sslc_grades
            : formData.cbse_marks,
            
        bonus_points: {
          ncc: formData.ncc_selected,
          ncc_type: formData.ncc_type,
          dependent_jawans_killed: formData.dependent_jawans_killed,
          dependent_jawans_service: formData.dependent_jawans_service,
        },
        
        sports_participation: {
          state_level: parseInt(typeof formData.sports_state_participation === 'string' ? formData.sports_state_participation : formData.sports_state_participation.toString()) || 0,
          district_level: formData.sports_district,
        },
        
        kalolsavam_participation: {
          state_level: parseInt(typeof formData.kalolsavam_state_participation === 'string' ? formData.kalolsavam_state_participation : formData.kalolsavam_state_participation.toString()) || 0,
          district_level: formData.kalolsavam_district,
        },
        
        co_curricular_activities: formData.co_curricular,
        eligibility: formData.eligibility,
        national_state_test: formData.national_state_test,
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from("applications")
        .insert([submissionData])
        .select();

      if (error) {
        console.error("Error submitting application:", error);
        alert("Please check your details and try again.");
      } else {
        console.log("Application submitted successfully:", data);
        
        try {
          // Generate a secure one-time token for the success page
          const token = generateSecureToken();
          console.log(token);
          
          // Store key form data in sessionStorage for the success page to access
          const formKeys = [
            'fee_paid', 'google_pay_number', 'payment_date', 'applicant_name',
            'mobile_number', 'whatsapp_number', 'single_window_appln_no',
            'qualifying_exam', 'register_number', 'exam_year', 'school_name',
            'gender', 'religion', 'date_of_birth', 'mother_name', 'father_name',
            'permanent_address', 'house_name', 'post_office', 'taluk',
            'panchayath_municipality', 'exam_type', 'eligibility', 'declaration',
            'sslc_grades', 'cbse_marks', 'sports_state_participation', 'sports_district',
            'kalolsavam_state_participation', 'kalolsavam_district', 'co_curricular',
            'course_preferences', 'national_state_test'
          ];
          
          // Store basic form fields
          formKeys.forEach(key => {
            if (formData[key as keyof FormData]) {
              const value = formData[key as keyof FormData];
              // Check if the value is an object and stringify it
              if (typeof value === 'object' && value !== null) {
                sessionStorage.setItem(key, JSON.stringify(value));
              } else {
                sessionStorage.setItem(key, String(value));
              }
            }
          });
          
          // Store course preferences 
          formData.course_preferences.forEach((pref, index) => {
            if (pref) {
              const courseName = courseOptions.find(c => c.code === pref)?.name || '';
              sessionStorage.setItem(`course_preferences[${index}]`, `${pref} - ${courseName}`);
            }
          });
          
          // Store submission token and timestamp
          sessionStorage.setItem('submissionToken', token);
          sessionStorage.setItem('submissionTimestamp', Date.now().toString());
          
          // Redirect to success page with token
          router.push(`/apply/success?token=${encodeURIComponent(token)}`);
        } catch (e) {
          // Session storage might be disabled in some browsers
          console.warn('Session storage not available:', e);
          // Fallback to direct redirect without token (less secure)
          router.push('/apply/success');
        }
      }
    } catch (error) {
      console.error("Error in submission process:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate a secure random token
  const generateSecureToken = (): string => {
    // Create a random string using Math.random which is more reliable
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Application Submission</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="font-medium text-amber-600">
                IMPORTANT: You can only submit one time with one register number.
              </p>
              <p>
                Please ensure all the information provided is correct before proceeding.
                After submission, you will not be able to edit your application.
              </p>
              <p>
                Register Number: <span className="font-medium">{formData.register_number}</span>
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Check Again</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Yes, Submit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Fee Paid<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="fee_paid"
                    value={formData.fee_paid}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Google Pay Number<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="google_pay_number"
                    value={formData.google_pay_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Date<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    name="payment_date"
                    value={formData.payment_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Name of Applicant<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="applicant_name"
                    value={formData.applicant_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter name in Block letters"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Mobile Number<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    WhatsApp Number<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter 10 digit number"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Single Window System Appln. No<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="number"
                    name="single_window_appln_no"
                    value={formData.single_window_appln_no}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter 10 digit number"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Name of qualifying examination<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <select
                    name="qualifying_exam"
                    value={formData.qualifying_exam}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">
                      Select name of qualifying examination
                    </option>
                    <option value="sslc">SSLC</option>
                    <option value="cbse">CBSE</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Register number<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="register_number"
                    value={formData.register_number}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      registerNumberError 
                        ? 'border-red-500' 
                        : formData.register_number.trim() && !isCheckingRegisterNumber && !registerNumberError 
                          ? 'border-green-500' 
                          : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-1 ${
                      registerNumberError 
                        ? 'focus:ring-red-500' 
                        : formData.register_number.trim() && !isCheckingRegisterNumber && !registerNumberError 
                          ? 'focus:ring-green-500' 
                          : 'focus:ring-blue-500'
                    }`}
                    placeholder="Enter your Register number"
                    required
                  />
                  {isCheckingRegisterNumber && (
                    <p className="text-sm text-gray-500 mt-1">Checking register number...</p>
                  )}
                  {registerNumberError && (
                    <p className="text-sm text-red-500 mt-1">{registerNumberError}</p>
                  )}
                  {formData.register_number.trim() && !isCheckingRegisterNumber && !registerNumberError && (
                    <p className="text-sm text-green-500 mt-1">Register number is valid and unique.</p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Year<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <select
                    name="exam_year"
                    value={formData.exam_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Year</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Name of school in which studied<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Gender<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="male"
                        name="gender"
                        type="radio"
                        value="male"
                        checked={formData.gender === "male"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        required
                      />
                      <label
                        htmlFor="male"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Male
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="female"
                        name="gender"
                        type="radio"
                        value="female"
                        checked={formData.gender === "female"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="female"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Female
                      </label>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Religion<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <select
                    name="religion"
                    value={formData.religion}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Religion</option>
                    <option value="Islam">Islam</option>
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date of Birth<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Name of Mother/Father<span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="mother_name"
                    value={formData.mother_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Mother name"
                    required
                  />
                  <input
                    type="text"
                    name="father_name"
                    value={formData.father_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Father name"
                    required
                  />
                </div>
              </div>

              {/* Permanent Address Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Permanent Address<span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      name="permanent_address"
                      value={formData.permanent_address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                      required
                    ></textarea>
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      House Name<span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="house_name"
                      value={formData.house_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Post Office<span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="post_office"
                      value={formData.post_office}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Taluk<span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="taluk"
                      value={formData.taluk}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Panchayath/Municipality<span className="text-red-500">*</span>
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      name="panchayath_municipality"
                      value={formData.panchayath_municipality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Grades obtained for the qualifying examination */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Grades obtained for the qualifying examination<span className="text-red-500">*</span>
                </h3>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <input
                      id="sslc"
                      name="exam_type"
                      type="radio"
                      value="sslc"
                      checked={formData.exam_type === "sslc"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      required
                    />
                    <label
                      htmlFor="sslc"
                      className="ml-2 text-sm text-gray-700"
                    >
                      SSLC
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="cbse"
                      name="exam_type"
                      type="radio"
                      value="cbse"
                      checked={formData.exam_type === "cbse"}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="cbse"
                      className="ml-2 text-sm text-gray-700"
                    >
                      CBSE
                    </label>
                  </div>
                </div>

                {/* Conditional rendering based on exam type */}
                {formData.exam_type === "sslc" && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        English
                      </label>
                      <select
                        name="sslc_grades.english"
                        value={formData.sslc_grades.english}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language 1
                      </label>
                      <select
                        name="sslc_grades.language1"
                        value={formData.sslc_grades.language1}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language 2
                      </label>
                      <select
                        name="sslc_grades.language2"
                        value={formData.sslc_grades.language2}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hindi
                      </label>
                      <select
                        name="sslc_grades.hindi"
                        value={formData.sslc_grades.hindi}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Science
                      </label>
                      <select
                        name="sslc_grades.social_science"
                        value={formData.sslc_grades.social_science}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Physics
                      </label>
                      <select
                        name="sslc_grades.physics"
                        value={formData.sslc_grades.physics}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chemistry
                      </label>
                      <select
                        name="sslc_grades.chemistry"
                        value={formData.sslc_grades.chemistry}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Biology
                      </label>
                      <select
                        name="sslc_grades.biology"
                        value={formData.sslc_grades.biology}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mathematics
                      </label>
                      <select
                        name="sslc_grades.maths"
                        value={formData.sslc_grades.maths}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Information Technology
                      </label>
                      <select
                        name="sslc_grades.information_technology"
                        value={formData.sslc_grades.information_technology}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required={formData.exam_type === "sslc"}
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D+">D+</option>
                      </select>
                    </div>
                  </div>
                )}

                {formData.exam_type === "cbse" && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        English
                      </label>
                      <input
                        type="number"
                        name="cbse_marks.english"
                        value={formData.cbse_marks.english}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max="100"
                        required={formData.exam_type === "cbse"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <input
                        type="number"
                        name="cbse_marks.language"
                        value={formData.cbse_marks.language}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max="100"
                        required={formData.exam_type === "cbse"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Science
                      </label>
                      <input
                        type="number"
                        name="cbse_marks.social_science"
                        value={formData.cbse_marks.social_science}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max="100"
                        required={formData.exam_type === "cbse"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Science
                      </label>
                      <input
                        type="number"
                        name="cbse_marks.science"
                        value={formData.cbse_marks.science}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max="100"
                        required={formData.exam_type === "cbse"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mathematics
                      </label>
                      <input
                        type="number"
                        name="cbse_marks.maths"
                        value={formData.cbse_marks.maths}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                        max="100"
                        required={formData.exam_type === "cbse"}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Course Preference */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Course Preference<span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-6 gap-4 mb-2 font-medium">
                  <div className="col-span-1">Preference</div>
                  <div className="col-span-5">Course Code/Subject</div>
                </div>
                <div className="grid grid-cols-6 gap-4 mb-2">
                  <div className="col-span-1">1</div>
                  <div className="col-span-5">
                    <select
                      name="course_preferences[0]"
                      value={formData.course_preferences[0]}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
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
                <div className="grid grid-cols-6 gap-4 mb-2">
                  <div className="col-span-1">2</div>
                  <div className="col-span-5">
                    <select
                      name="course_preferences[1]"
                      value={formData.course_preferences[1]}
                      onChange={handleInputChange}
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
                <div className="grid grid-cols-6 gap-4 mb-2">
                  <div className="col-span-1">3</div>
                  <div className="col-span-5">
                    <select
                      name="course_preferences[2]"
                      value={formData.course_preferences[2]}
                      onChange={handleInputChange}
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
              </div>

              {/* Bonus Points Section */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Whether the applicant is eligible for bonus points under the
                  following category
                </h3>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <input
                      id="ncc"
                      name="ncc_selected"
                      type="checkbox"
                      checked={formData.ncc_selected}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="ncc" className="ml-2 text-sm text-gray-700">
                      NCC Scout & Guides (Student Police Cadet or attached in
                      Part)
                    </label>
                  </div>
                </div>

                {formData.ncc_selected && (
                  <div className="ml-6 mb-4 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="ncc_type_ncc"
                        name="ncc_type.ncc"
                        type="checkbox"
                        checked={formData.ncc_type.ncc}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="ncc_type_ncc"
                        className="ml-2 text-sm text-gray-700"
                      >
                        NCC
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="ncc_type_scouts_guides"
                        name="ncc_type.scouts_guides"
                        type="checkbox"
                        checked={formData.ncc_type.scouts_guides}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="ncc_type_scouts_guides"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Scouts & Guides
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="ncc_type_student_police_cadet"
                        name="ncc_type.student_police_cadet"
                        type="checkbox"
                        checked={formData.ncc_type.student_police_cadet}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="ncc_type_student_police_cadet"
                        className="ml-2 text-sm text-gray-700"
                      >
                        Student Police Cadet
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <input
                      id="dependent_jawans_killed"
                      name="dependent_jawans_killed"
                      type="checkbox"
                      checked={formData.dependent_jawans_killed}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="dependent_jawans_killed"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Dependent of Jawans killed in action
                    </label>
                  </div>
                </div>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <input
                      id="dependent_jawans_service"
                      name="dependent_jawans_service"
                      type="checkbox"
                      checked={formData.dependent_jawans_service}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="dependent_jawans_service"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Dependent of Jawans in Service or Ex-Service
                    </label>
                  </div>
                </div>
              </div>

              {/* Sports Participation */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Participation in Sports
                </h3>
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Level Participation (Number of items participated)
                      </label>
                      <input
                        type="number"
                        name="sports_state_participation"
                        value={formData.sports_state_participation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    District Level (Number of grades won in the relevant boxes)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        A Grade
                      </label>
                      <input
                        type="number"
                        name="sports_district.a_grade"
                        value={formData.sports_district.a_grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        B Grade
                      </label>
                      <input
                        type="number"
                        name="sports_district.b_grade"
                        value={formData.sports_district.b_grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        C Grade
                      </label>
                      <input
                        type="number"
                        name="sports_district.c_grade"
                        value={formData.sports_district.c_grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participation
                      </label>
                      <input
                        type="number"
                        name="sports_district.participation"
                        value={formData.sports_district.participation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Kalolsavam Participation */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Participation in Kerala School Kalolsavam
                </h3>
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Level Participation (Number of items participated)
                      </label>
                      <input
                        type="number"
                        name="kalolsavam_state_participation"
                        value={formData.kalolsavam_state_participation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-800 mb-2">
                    District Level (Number of grades won in the relevant boxes)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        A Grade
                      </label>
                      <input
                        type="number"
                        name="kalolsavam_district.a_grade"
                        value={formData.kalolsavam_district.a_grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        B Grade
                      </label>
                      <input
                        type="number"
                        name="kalolsavam_district.b_grade"
                        value={formData.kalolsavam_district.b_grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        C Grade
                      </label>
                      <input
                        type="number"
                        name="kalolsavam_district.c_grade"
                        value={formData.kalolsavam_district.c_grade}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Participation
                      </label>
                      <input
                        type="number"
                        name="kalolsavam_district.participation"
                        value={formData.kalolsavam_district.participation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* National/State Level Test */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Whether qualified in the National/State Level Test for the
                  National Talent Search Examination
                </h3>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <input
                      id="yes_qualified"
                      name="national_state_test"
                      type="radio"
                      value="true"
                      checked={formData.national_state_test === true}
                      onChange={() =>
                        setFormData({ ...formData, national_state_test: true })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="yes_qualified"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Yes
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="no_qualified"
                      name="national_state_test"
                      type="radio"
                      value="false"
                      checked={formData.national_state_test === false}
                      onChange={() =>
                        setFormData({ ...formData, national_state_test: false })
                      }
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="no_qualified"
                      className="ml-2 text-sm text-gray-700"
                    >
                      No
                    </label>
                  </div>
                </div>
              </div>

              {/* Co-curricular Activities */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  (e) Details of participation in co-curricular activities.
                  Write the number of grades won in the relevant boxes.
                </h3>
                <div className="grid grid-cols-6 gap-2 mb-2 font-medium">
                  <div className="col-span-1"></div>
                  <div className="col-span-1">A Grade</div>
                  <div className="col-span-1">B Grade</div>
                  <div className="col-span-1">C Grade</div>
                  <div className="col-span-1">D Grade</div>
                  <div className="col-span-1">E Grade</div>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="col-span-1">State Science Fair</div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_science_fair.a"
                      value={formData.co_curricular.state_science_fair.a}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_science_fair.b"
                      value={formData.co_curricular.state_science_fair.b}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_science_fair.c"
                      value={formData.co_curricular.state_science_fair.c}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_science_fair.d"
                      value={formData.co_curricular.state_science_fair.d}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_science_fair.e"
                      value={formData.co_curricular.state_science_fair.e}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="col-span-1">State Social Science Fair</div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_social_science_fair.a"
                      value={formData.co_curricular.state_social_science_fair.a}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_social_science_fair.b"
                      value={formData.co_curricular.state_social_science_fair.b}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_social_science_fair.c"
                      value={formData.co_curricular.state_social_science_fair.c}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_social_science_fair.d"
                      value={formData.co_curricular.state_social_science_fair.d}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_social_science_fair.e"
                      value={formData.co_curricular.state_social_science_fair.e}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="col-span-1">State Maths Fair</div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_maths_fair.a"
                      value={formData.co_curricular.state_maths_fair.a}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_maths_fair.b"
                      value={formData.co_curricular.state_maths_fair.b}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_maths_fair.c"
                      value={formData.co_curricular.state_maths_fair.c}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_maths_fair.d"
                      value={formData.co_curricular.state_maths_fair.d}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_maths_fair.e"
                      value={formData.co_curricular.state_maths_fair.e}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="col-span-1">State IT Fest</div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_it_fest.a"
                      value={formData.co_curricular.state_it_fest.a}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_it_fest.b"
                      value={formData.co_curricular.state_it_fest.b}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_it_fest.c"
                      value={formData.co_curricular.state_it_fest.c}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_it_fest.d"
                      value={formData.co_curricular.state_it_fest.d}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_it_fest.e"
                      value={formData.co_curricular.state_it_fest.e}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-2">
                  <div className="col-span-1">State Work Experience Fair</div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_work_experience_fair.a"
                      value={
                        formData.co_curricular.state_work_experience_fair.a
                      }
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_work_experience_fair.b"
                      value={
                        formData.co_curricular.state_work_experience_fair.b
                      }
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_work_experience_fair.c"
                      value={
                        formData.co_curricular.state_work_experience_fair.c
                      }
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_work_experience_fair.d"
                      value={
                        formData.co_curricular.state_work_experience_fair.d
                      }
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                  <div className="col-span-1">
                    <input
                      type="number"
                      name="co_curricular.state_work_experience_fair.e"
                      value={
                        formData.co_curricular.state_work_experience_fair.e
                      }
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Eligibility Checkboxes */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  (f) (Tick checkboxes if eligible)
                </h3>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <input
                      id="little_kites"
                      name="eligibility.little_kites"
                      type="checkbox"
                      checked={formData.eligibility.little_kites}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="little_kites"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Little Kites (5 Grade)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="jrc"
                      name="eligibility.jrc"
                      type="checkbox"
                      checked={formData.eligibility.jrc}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="jrc" className="ml-2 text-sm text-gray-700">
                      JRC
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="nss"
                      name="eligibility.nss"
                      type="checkbox"
                      checked={formData.eligibility.nss}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="nss" className="ml-2 text-sm text-gray-700">
                      NSS
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Clubs
                    </label>
                    <input
                      type="number"
                      name="eligibility.clubs_count"
                      value={formData.eligibility.clubs_count}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  DECLARATION
                </h3>
                <div className="flex items-start mb-6">
                  <div className="flex items-center h-5">
                    <input
                      id="declaration"
                      name="declaration"
                      type="checkbox"
                      checked={formData.declaration}
                      onChange={handleInputChange}
                      className="w-4 h-4 border border-gray-300 rounded focus:ring-3 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="declaration"
                      className="font-medium text-gray-700"
                    >
                      I do hereby declare that the information furnished above
                      is true and correct to the best of my knowledge and
                      belief. We know that falsely information may lead to the
                      cancellation of application.
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
