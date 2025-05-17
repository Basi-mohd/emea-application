import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';
import * as XLSX from 'xlsx';

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@emeahss.edu";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all applications for export
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching applications for export:", error);
      return new NextResponse(JSON.stringify({ error: 'Failed to fetch applications' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Format data for Excel
    const formattedData = data.map(app => {
      // Basic applicant information
      const baseData = {
        'Application Number': app.application_number || 'N/A',
        'Register Number': app.register_number,
        'Applicant Name': app.applicant_name,
        'Mobile Number': app.mobile_number,
        'WhatsApp Number': app.whatsapp_number,
        'Gender': app.gender,
        'Religion': app.religion,
        'Date of Birth': app.date_of_birth,
        'Fee Paid': app.fee_paid,
        'Google Pay Number': app.google_pay_number,
        'Payment Date': app.payment_date,
        'Qualifying Exam': app.qualifying_exam,
        'Exam Year': app.exam_year,
        'Exam Type': app.exam_type,
        'School Name': app.school_name,
        'Address': app.permanent_address,
        'House Name': app.house_name,
        'Post Office': app.post_office,
        'Taluk': app.taluk, 
        'Panchayath/Municipality': app.panchayath_municipality,
        'Mother Name': app.mother_name,
        'Father Name': app.father_name,
        'Course Preference 1': app.course_preferences?.[0]?.name || '',
        'Course Preference 2': app.course_preferences?.[1]?.name || '',
        'Course Preference 3': app.course_preferences?.[2]?.name || '',
      };
      
      // Grade information based on exam type
      const gradeData: Record<string, string | number> = {};
      if (app.subject_grades) {
        if (app.exam_type === 'sslc') {
          // SSLC grades
          gradeData['English Grade'] = app.subject_grades.english || '';
          gradeData['Language 1 Grade'] = app.subject_grades.language1 || '';
          gradeData['Language 2 Grade'] = app.subject_grades.language2 || '';
          gradeData['Hindi Grade'] = app.subject_grades.hindi || '';
          gradeData['Social Science Grade'] = app.subject_grades.social_science || '';
          gradeData['Physics Grade'] = app.subject_grades.physics || '';
          gradeData['Chemistry Grade'] = app.subject_grades.chemistry || '';
          gradeData['Biology Grade'] = app.subject_grades.biology || '';
          gradeData['Mathematics Grade'] = app.subject_grades.maths || '';
          gradeData['IT Grade'] = app.subject_grades.information_technology || '';
        } else if (app.exam_type === 'cbse') {
          // CBSE marks
          gradeData['English Marks'] = app.subject_grades.english || '';
          gradeData['Language Marks'] = app.subject_grades.language || '';
          gradeData['Social Science Marks'] = app.subject_grades.social_science || '';
          gradeData['Science Marks'] = app.subject_grades.science || '';
          gradeData['Mathematics Marks'] = app.subject_grades.maths || '';
        }
      }
      
      // Additional qualification data
      const additionalData = {
        'National Talent Search Examination': app.national_state_test ? 'Yes' : 'No',
        'NCC': app.bonus_points?.ncc ? 'Yes' : 'No',
        'Scouts & Guides': app.bonus_points?.ncc_type?.scouts_guides ? 'Yes' : 'No',
        'Student Police Cadet': app.bonus_points?.ncc_type?.student_police_cadet ? 'Yes' : 'No',
        'Little Kites': app.eligibility?.little_kites ? 'Yes' : 'No',
        'JRC': app.eligibility?.jrc ? 'Yes' : 'No',
        'NSS': app.eligibility?.nss ? 'Yes' : 'No',
        'Clubs Count': app.eligibility?.clubs_count || 0,
        'Submitted On': new Date(app.created_at).toLocaleString(),
      };
      
      // Sports and Kalolsavam participation
      const participationData = {
        'Sports State Participation': app.sports_participation?.state_level || 0,
        'Sports A Grade': app.sports_participation?.district_level?.a_grade || 0,
        'Sports B Grade': app.sports_participation?.district_level?.b_grade || 0,
        'Sports C Grade': app.sports_participation?.district_level?.c_grade || 0,
        'Sports Participation': app.sports_participation?.district_level?.participation || 0,
        'Kalolsavam State Participation': app.kalolsavam_participation?.state_level || 0,
        'Kalolsavam A Grade': app.kalolsavam_participation?.district_level?.a_grade || 0,
        'Kalolsavam B Grade': app.kalolsavam_participation?.district_level?.b_grade || 0,
        'Kalolsavam C Grade': app.kalolsavam_participation?.district_level?.c_grade || 0,
        'Kalolsavam Participation': app.kalolsavam_participation?.district_level?.participation || 0,
      };
      
      // Co-curricular activities data
      const coCurricularData: Record<string, string | number> = {};
      if (app.co_curricular_activities) {
        const activities = [
          { key: 'state_science_fair', name: 'Science Fair' },
          { key: 'state_social_science_fair', name: 'Social Science Fair' },
          { key: 'state_maths_fair', name: 'Maths Fair' },
          { key: 'state_it_fest', name: 'IT Fest' },
          { key: 'state_work_experience_fair', name: 'Work Experience Fair' }
        ];
        
        activities.forEach(activity => {
          const activityData = app.co_curricular_activities[activity.key];
          if (activityData) {
            coCurricularData[`${activity.name} A Grade`] = activityData.a || 0;
            coCurricularData[`${activity.name} B Grade`] = activityData.b || 0;
            coCurricularData[`${activity.name} C Grade`] = activityData.c || 0;
            coCurricularData[`${activity.name} D Grade`] = activityData.d || 0;
            coCurricularData[`${activity.name} E Grade`] = activityData.e || 0;
          }
        });
      }
      
      // Combine all data
      return {
        ...baseData,
        ...gradeData,
        ...additionalData,
        ...participationData,
        ...coCurricularData
      };
    });
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    
    // Auto-size columns
    const colWidths: number[] = [];
    formattedData.forEach(row => {
      Object.keys(row).forEach((key, i) => {
        const value = String(row[key as keyof typeof row] || '');
        colWidths[i] = Math.max(colWidths[i] || 0, value.length, key.length);
      });
    });
    
    worksheet['!cols'] = colWidths.map(w => ({ wch: Math.min(w + 2, 50) })); // Add padding and cap width
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="EMEAHSS_Applications_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate Excel file' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 