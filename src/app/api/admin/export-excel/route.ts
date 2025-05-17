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
    const formattedData = data.map(app => ({
      'Application ID': app.id,
      'Register Number': app.register_number,
      'Applicant Name': app.applicant_name,
      'Mobile Number': app.mobile_number,
      'WhatsApp Number': app.whatsapp_number,
      'Single Window Appln. No': app.single_window_appln_no,
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
      'Submitted On': new Date(app.created_at).toLocaleString(),
    }));
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    
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